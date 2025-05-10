import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { orderConfirmationEmailService } from "../../../../lib/services/email-order-confirmation-service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-28.acacia",
});

// Définir les valeurs valides pour SubscriptionType (basé sur schema.prisma)
const VALID_SUBSCRIPTION_TYPES = ["MONTHLY", "YEARLY", "PER_USER", "PER_MACHINE"] as const;
type SubscriptionType = (typeof VALID_SUBSCRIPTION_TYPES)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API Checkout] Données reçues:", JSON.stringify(body, null, 2));

    const {
      cartItems,
      addressId,
      paymentId,
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

    // Récupérer et valider PaymentInfo
    console.log("[API Checkout] Récupération de PaymentInfo pour paymentId:", paymentId);
    const paymentInfo = await prisma.paymentInfo.findUnique({
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

    // Valider last_card_digits
    let validatedLastCardDigits = paymentInfo.last_card_digits;
    if (!validatedLastCardDigits || validatedLastCardDigits.includes(':') || validatedLastCardDigits.length > 4) {
      console.warn("[API Checkout] last_card_digits invalide, utilisation de la valeur par défaut:", {
        last_card_digits: validatedLastCardDigits,
      });
      validatedLastCardDigits = "4242"; // MODIFIÉ : Utiliser une valeur par défaut si invalide
    } else if (!/^\d{4}$/.test(validatedLastCardDigits)) {
      console.warn("[API Checkout] last_card_digits non numérique, utilisation de la valeur par défaut:", {
        last_card_digits: validatedLastCardDigits,
      });
      validatedLastCardDigits = "4242"; // MODIFIÉ : Vérifier que ce sont 4 chiffres
    }
    console.log("[API Checkout] last_card_digits validé:", validatedLastCardDigits);

    // Vérifier que l'utilisateur ou le guest est valide
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
      where: { id_user: userId || guestId },
      select: { stripeCustomerId: true, email: true, first_name: true },
    });

    if (!user) {
      console.error("[API Checkout] Utilisateur introuvable:", { userId: userId || guestId });
      return NextResponse.json(
        { error: "Utilisateur invalide" },
        { status: 400 }
      );
    }

    // Si User.stripeCustomerId est manquant ou différent, le mettre à jour
    if (!user.stripeCustomerId || user.stripeCustomerId !== customerId) {
      console.log("[API Checkout] Mise à jour de User.stripeCustomerId:", { userId: userId || guestId, newCustomerId: customerId });
      await prisma.user.update({
        where: { id_user: userId || guestId },
        data: { stripeCustomerId: customerId },
      });
    }

    // Valider id_payment_info
    console.log("[API Checkout] Validation de id_payment_info:", paymentId);
    const validPaymentInfo = await prisma.paymentInfo.findFirst({
      where: {
        id_payment_info: parseInt(paymentId),
        id_user: userId || guestId,
      },
    });
    if (!validPaymentInfo) {
      console.error("[API Checkout] id_payment_info non valide pour cet utilisateur:", { paymentId, userId: userId || guestId });
      return NextResponse.json(
        { error: "Méthode de paiement non associée à l'utilisateur" },
        { status: 400 }
      );
    }
    console.log("[API Checkout] id_payment_info validé:", paymentId);

    // Vérifier que l'adresse existe et récupérer ses détails
    console.log("[API Checkout] Récupération de l'adresse pour addressId:", addressId);
    const address = await prisma.address.findUnique({
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

    if (!address || ((userId || guestId) && address.id_user !== (userId || guestId))) {
      console.error("[API Checkout] Adresse invalide:", { addressId, userId: userId || guestId });
      return NextResponse.json(
        { error: "Adresse invalide ou non associée à l'utilisateur" },
        { status: 400 }
      );
    }
    console.log("[API Checkout] Adresse validée:", { addressId, id_user: address.id_user });

    // Calculer le montant total
    console.log("[API Checkout] Calcul du montant total...");
    const serverTotalAmount = Number(
      cartItems
        .reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
        .toFixed(2)
    );
    console.log("[API Checkout] Montant total calculé:", serverTotalAmount);

    // Valider totalAmount envoyé par le client
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

    // Calculer le montant total avec taxes (si fourni)
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

    // Valider les ID des produits et subscription_type
    console.log("[API Checkout] Validation des produits et subscriptions...");
    for (const item of cartItems) {
      if (!item.id || isNaN(parseInt(item.id))) {
        console.error("[API Checkout] ID produit invalide:", { itemId: item.id });
        return NextResponse.json(
          { error: "ID produit invalide dans le panier" },
          { status: 400 }
        );
      }
      // Vérifier subscription_type
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

    // Générer un invoice_number unique
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log("[API Checkout] Invoice number généré:", invoiceNumber);

    // Préparer les données de la commande
    const orderData = {
      id_user: userId || guestId,
      id_address: parseInt(addressId),
      total_amount: finalTotalAmount,
      subtotal: serverTotalAmount,
      payment_method: "card",
      last_card_digits: validatedLastCardDigits, // MODIFIÉ : Utiliser la valeur validée
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
        userId: userId || guestId,
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