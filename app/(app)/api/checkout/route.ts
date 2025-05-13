import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { orderConfirmationEmailService } from "../../../../lib/services/email-order-confirmation-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-28.acacia",
});

const VALID_SUBSCRIPTION_TYPES = ["MONTHLY", "YEARLY", "PER_USER", "PER_MACHINE"] as const;
type SubscriptionType = (typeof VALID_SUBSCRIPTION_TYPES)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API Checkout] Données reçues:", JSON.stringify(body, null, 2));

    const {
      cartItems,
      addressId,
      addressData,
      paymentId,
      paymentData,
      totalAmount: clientTotalAmount,
      taxes,
      guestId,
      guestEmail,
      sessionToken,
    } = body;

    // Valider les données
    console.log("[API Checkout] Validation des données d'entrée...");
    if (!cartItems || !cartItems.length || !addressId || !paymentId || clientTotalAmount == null) {
      console.error("[API Checkout] Données manquantes:", { cartItems, addressId, paymentId, clientTotalAmount });
      return NextResponse.json(
        { error: "Données manquantes: panier, adresse, paiement ou montant total requis" },
        { status: 400 }
      );
    }

    // Gérer PaymentInfo
    let paymentInfo;
    let validatedLastCardDigits;

    if (guestId && paymentData) {
      console.log("[API Checkout] Mode invité, utilisation de paymentData:", paymentData);
      if (!paymentData.stripe_payment_id || !paymentData.stripe_customer_id) {
        console.error("[API Checkout] paymentData invalide:", paymentData);
        return NextResponse.json(
          { error: "Informations de paiement Stripe manquantes pour l'invité" },
          { status: 400 }
        );
      }

      // Valider last_card_digits
      if (!paymentData.last_card_digits || typeof paymentData.last_card_digits !== 'string') {
        console.error("[API Checkout] last_card_digits invalide:", paymentData.last_card_digits);
        return NextResponse.json(
          { error: "last_card_digits doit être une chaîne non vide" },
          { status: 400 }
        );
      }

      console.log("[API Checkout] Création d'un PaymentInfo temporaire pour l'invité...");
      paymentInfo = await prisma.paymentInfo.create({
        data: {
          id_user: parseInt(guestId, 10),
          card_name: paymentData.card_name || "Guest Card",
          last_card_digits: paymentData.last_card_digits, // Chaîne chiffrée
          stripe_payment_id: paymentData.stripe_payment_id,
          stripe_customer_id: paymentData.stripe_customer_id,
          brand: paymentData.brand || "unknown",
          exp_month: paymentData.exp_month || 12,
          exp_year: paymentData.exp_year || new Date().getFullYear() + 1,
        },
      });
      console.log("[API Checkout] PaymentInfo temporaire créé:", {
        id_payment_info: paymentInfo.id_payment_info,
        stripe_payment_id: paymentInfo.stripe_payment_id,
        stripe_customer_id: paymentInfo.stripe_customer_id,
        last_card_digits: paymentData.last_card_digits,
      });

      validatedLastCardDigits = paymentData.last_card_digits; // Utiliser la valeur chiffrée
    } else {
      console.log("[API Checkout] Récupération de PaymentInfo pour paymentId:", paymentId);
      paymentInfo = await prisma.paymentInfo.findUnique({
        where: { id_payment_info: parseInt(paymentId) },
        select: { id_user: true, stripe_payment_id: true, stripe_customer_id: true, last_card_digits: true },
      });

      if (!paymentInfo || !paymentInfo.stripe_payment_id || !paymentInfo.stripe_customer_id) {
        console.error("[API Checkout] PaymentInfo invalide:", { paymentInfo });
        return NextResponse.json(
          { error: "Méthode de paiement invalide ou informations Stripe manquantes" },
          { status: 400 }
        );
      }
      console.log("[API Checkout] PaymentInfo récupéré:", {
        id_user: paymentInfo.id_user,
        stripe_payment_id: paymentInfo.stripe_payment_id,
        stripe_customer_id: paymentInfo.stripe_customer_id,
      });

      validatedLastCardDigits = paymentInfo.last_card_digits;
      // Accepter une chaîne chiffrée (pas de validation de longueur ou de chiffres)
      if (!validatedLastCardDigits || typeof validatedLastCardDigits !== 'string') {
        console.error("[API Checkout] last_card_digits invalide:", validatedLastCardDigits);
        return NextResponse.json(
          { error: "last_card_digits doit être une chaîne non vide" },
          { status: 400 }
        );
      }
      console.log("[API Checkout] last_card_digits validé:", validatedLastCardDigits);
    }

    // Vérifier l'utilisateur ou le guest
    let userId = paymentInfo.id_user;
    let customerId = paymentInfo.stripe_customer_id;

    console.log("[API Checkout] Validation de l'utilisateur/invité...");
    if (!userId && !guestId) {
      console.error("[API Checkout] Aucun utilisateur ou invité spécifié");
      return NextResponse.json(
        { error: "Utilisateur ou invité requis" },
        { status: 400 }
      );
    }

    console.log("[API Checkout] Récupération de l'utilisateur pour userId:", userId || guestId);
    const user = await prisma.user.findUnique({
      where: { id_user: userId || parseInt(guestId, 10) },
      select: { stripeCustomerId: true, email: true, first_name: true },
    });

    if (!user) {
      console.error("[API Checkout] Utilisateur introuvable:", { userId: userId || guestId });
      return NextResponse.json(
        { error: "Utilisateur invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour stripeCustomerId si nécessaire
    if (!user.stripeCustomerId || user.stripeCustomerId !== customerId) {
      console.log("[API Checkout] Mise à jour de User.stripeCustomerId:", { userId: userId || guestId, newCustomerId: customerId });
      await prisma.user.update({
        where: { id_user: userId || parseInt(guestId, 10) },
        data: { stripeCustomerId: customerId },
      });
    }

    // Valider id_payment_info pour le mode connecté
    if (!guestId) {
      console.log("[API Checkout] Validation de id_payment_info:", paymentId);
      const validPaymentInfo = await prisma.paymentInfo.findFirst({
        where: {
          id_payment_info: parseInt(paymentId),
          id_user: userId,
        },
      });
      if (!validPaymentInfo) {
        console.error("[API Checkout] id_payment_info non valide pour cet utilisateur:", { paymentId, userId });
        return NextResponse.json(
          { error: "Méthode de paiement non associée à l'utilisateur" },
          { status: 400 }
        );
      }
      console.log("[API Checkout] id_payment_info validé:", paymentId);
    }

    // Gérer l'adresse
    let address;
    let finalAddressId: number;

    if (guestId && addressData) {
      console.log("[API Checkout] Mode invité, création d'une adresse temporaire avec addressData:", addressData);
      if (
        !addressData.first_name ||
        !addressData.last_name ||
        !addressData.address1 ||
        !addressData.postal_code ||
        !addressData.city ||
        !addressData.country ||
        !addressData.mobile_phone
      ) {
        console.error("[API Checkout] addressData invalide:", addressData);
        return NextResponse.json(
          { error: "Informations d'adresse incomplètes pour l'invité" },
          { status: 400 }
        );
      }

      address = await prisma.address.create({
        data: {
          id_user: parseInt(guestId, 10),
          first_name: addressData.first_name,
          last_name: addressData.last_name,
          address1: addressData.address1,
          address2: addressData.address2 || null,
          postal_code: addressData.postal_code,
          city: addressData.city,
          country: addressData.country,
          mobile_phone: addressData.mobile_phone,
          region: addressData.region || null,
        },
      });
      console.log("[API Checkout] Adresse temporaire créée:", {
        id_address: address.id_address,
        id_user: address.id_user,
      });
      finalAddressId = address.id_address;
    } else {
      console.log("[API Checkout] Récupération de l'adresse pour addressId:", addressId);
      address = await prisma.address.findUnique({
        where: { id_address: parseInt(addressId) },
        select: {
          id_user: true,
          address1: true,
          address2: true,
          city: true,
          postal_code: true,
          country: true,
          first_name: true,
          last_name: true,
        },
      });

      if (!address || (userId && address.id_user !== userId)) {
        console.error("[API Checkout] Adresse invalide:", { addressId, userId });
        return NextResponse.json(
          { error: "Adresse invalide ou non associée à l'utilisateur" },
          { status: 400 }
        );
      }
      console.log("[API Checkout] Adresse validée:", { addressId, id_user: address.id_user });
      finalAddressId = parseInt(addressId);
    }

    // Calculer le montant total
    console.log("[API Checkout] Calcul du montant total...");
    const serverTotalAmount = Number(
      cartItems
        .reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
        .toFixed(2)
    );
    console.log("[API Checkout] Montant total calculé:", serverTotalAmount);

    // Valider totalAmount
    if (Math.abs(serverTotalAmount - clientTotalAmount) > 0.01) {
      console.error("[API Checkout] Incohérence dans totalAmount:", {
        clientTotalAmount,
        serverTotalAmount,
      });
      return NextResponse.json(
        { error: `Montant total incohérent: client (${clientTotalAmount}) vs serveur (${serverTotalAmount})` },
        { status: 400 }
      );
    }

    // Calculer les taxes
    const taxesAmount = taxes && !isNaN(taxes) ? Number(taxes.toFixed(2)) : 0;
    const finalTotalAmount = serverTotalAmount + taxesAmount;
    console.log("[API Checkout] Montant final avec taxes:", finalTotalAmount);

    // Valider le montant
    if (serverTotalAmount <= 0 || isNaN(serverTotalAmount)) {
      console.error("[API Checkout] Montant total invalide:", { serverTotalAmount });
      return NextResponse.json(
        { error: "Montant total invalide ou nul" },
        { status: 400 }
      );
    }

    // Valider les produits et subscription_type
    console.log("[API Checkout] Validation des produits et subscriptions...");
    for (const item of cartItems) {
      if (!item.id || isNaN(parseInt(item.id))) {
        console.error("[API Checkout] ID produit invalide:", { itemId: item.id });
        return NextResponse.json(
          { error: "ID produit invalide dans le panier" },
          { status: 400 }
        );
      }
      if (!item.subscription_type || !VALID_SUBSCRIPTION_TYPES.includes(item.subscription_type)) {
        console.error("[API Checkout] Type de subscription manquant ou invalide:", {
          subscription_type: item.subscription_type,
          item,
        });
        return NextResponse.json(
          {
            error: `Type de subscription manquant ou invalide: ${item.subscription_type || 'undefined'}. Valeurs attendues: ${VALID_SUBSCRIPTION_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // Consolider les orderItems
    console.log("[API Checkout] Consolidation des orderItems...");
    const consolidatedItems = cartItems.reduce((acc: any[], item: any) => {
      const existing = acc.find(
        (i: any) => i.id_product === parseInt(item.id) && i.subscription_type === item.subscription_type
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({
          id_product: parseInt(item.id),
          quantity: item.quantity,
          unit_price: item.price,
          subscription_type: item.subscription_type as SubscriptionType,
          subscription_status: "ACTIVE",
          subscription_duration: item.subscription_type === "MONTHLY" ? 12 : item.subscription_type === "YEARLY" ? 1 : 1,
        });
      }
      return acc;
    }, []);
    console.log("[API Checkout] OrderItems consolidés:", JSON.stringify(consolidatedItems, null, 2));

    // Créer le PaymentIntent
    console.log("[API Checkout] Création du PaymentIntent:", {
      amount: Math.round(serverTotalAmount * 100),
      payment_method: paymentInfo.stripe_payment_id,
      customer: customerId,
    });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(serverTotalAmount * 100),
      currency: "eur",
      payment_method: paymentInfo.stripe_payment_id,
      customer: customerId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: { userId: (userId || guestId).toString(), guestEmail: guestEmail || undefined },
    });

    console.log("[API Checkout] PaymentIntent créé:", {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });

    // Générer un invoice_number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log("[API Checkout] Invoice number généré:", invoiceNumber);

    // Préparer les données de la commande
    const orderData = {
      id_user: userId || parseInt(guestId, 10),
      id_address: finalAddressId,
      total_amount: finalTotalAmount,
      subtotal: serverTotalAmount,
      payment_method: "card",
      last_card_digits: validatedLastCardDigits, // Chaîne chiffrée
      invoice_number: invoiceNumber,
      order_status: paymentIntent.status === "succeeded" ? "COMPLETED" : "PENDING",
      order_items: {
        create: consolidatedItems,
      },
    };
    console.log("[API Checkout] Données envoyées à prisma.order.create:", JSON.stringify(orderData, null, 2));

    // Créer la commande
    console.log("[API Checkout] Exécution de prisma.order.create...");
    const order = await prisma.order.create({
      data: orderData,
      include: { order_items: true, address: true },
    });
    console.log("[API Checkout] Commande créée:", { id_order: order.id_order });

    // Envoyer l'email de confirmation
    const emailToSend = user.email || guestEmail;
    if (!emailToSend) {
      console.warn("[API Checkout] Aucun email disponible pour envoyer la confirmation:", { userId: userId || guestId });
    } else {
      const emailSent = await orderConfirmationEmailService.sendOrderConfirmationEmail({
        orderId: order.id_order,
        userId: userId || parseInt(guestId, 10),
        email: emailToSend,
        firstName: user.first_name || undefined,
        orderItems: order.order_items.map(item => ({
          id_product: item.id_product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subscription_type: item.subscription_type,
        })),
        totalAmount: order.total_amount,
        address: {
          address1: order.address.address1,
          address2: order.address.address2 || undefined,
          city: order.address.city,
          postal_code: order.address.postal_code,
          country: order.address.country,
          first_name: order.address.first_name,
          last_name: order.address.last_name,
        },
        invoiceNumber: order.invoice_number,
        orderDate: order.order_date,
      });

      if (emailSent) {
        console.log("[API Checkout] Email de confirmation envoyé avec succès:", { orderId: order.id_order, email: emailToSend });
      } else {
        console.warn("[API Checkout] Échec de l'envoi de l'email de confirmation:", { orderId: order.id_order, email: emailToSend });
      }
    }

    console.log("[API Checkout] Paiement réussi:", {
      orderId: order.id_order,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });

    return NextResponse.json({
      orderId: order.id_order,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("[API Checkout] Erreur:", {
      message: error.message || "Erreur inconnue",
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    return NextResponse.json(
      {
        error: "Erreur lors du traitement du paiement",
        details: error.message || "Erreur inconnue",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}