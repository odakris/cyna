import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-28.acacia",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[API Checkout] Données reçues:", JSON.stringify(body, null, 2));

    const {
      cartItems,
      addressId,
      paymentId,
      guestId,
      guestEmail,
      sessionToken,
    } = body;

    // Valider les données
    console.log("[API Checkout] Validation des données d'entrée...");
    if (!cartItems || !cartItems.length || !addressId || !paymentId) {
      console.error("[API Checkout] Données manquantes:", { cartItems, addressId, paymentId });
      return NextResponse.json(
        { error: "Données manquantes: panier, adresse ou paiement requis" },
        { status: 400 }
      );
    }

    // Récupérer et valider PaymentInfo
    console.log("[API Checkout] Récupération de PaymentInfo pour paymentId:", paymentId);
    const paymentInfo = await prisma.paymentInfo.findUnique({
      where: { id_payment_info: parseInt(paymentId) },
      select: { id_user: true, stripe_payment_id: true, stripe_customer_id: true },
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

    if (userId) {
      console.log("[API Checkout] Récupération de l'utilisateur pour userId:", userId);
      const user = await prisma.user.findUnique({
        where: { id_user: userId },
        select: { stripeCustomerId: true },
      });

      if (!user || !user.stripeCustomerId) {
        console.error("[API Checkout] Utilisateur ou stripeCustomerId manquant:", { userId });
        return NextResponse.json(
          { error: "Utilisateur invalide ou client Stripe manquant" },
          { status: 400 }
        );
      }

      // Vérifier la cohérence entre PaymentInfo et User
      if (user.stripeCustomerId !== customerId) {
        console.error("[API Checkout] Incohérence stripe_customer_id:", {
          paymentInfo_customerId: customerId,
          user_customerId: user.stripeCustomerId,
        });
        return NextResponse.json(
          { error: "Incohérence dans les informations du client Stripe" },
          { status: 400 }
        );
      }

      // Valider id_payment_info
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
    } else if (guestId && guestEmail) {
      console.log("[API Checkout] Création d'un client Stripe pour l'invité:", { guestId, guestEmail });
      const guestCustomer = await stripe.customers.create({
        email: guestEmail,
        metadata: { guestId },
      });
      customerId = guestCustomer.id;
      console.log("[API Checkout] Client Stripe invité créé:", { customerId });
      userId = guestId; // Utiliser guestId comme id_user
    }

    // Vérifier que l'adresse existe
    console.log("[API Checkout] Récupération de l'adresse pour addressId:", addressId);
    const address = await prisma.address.findUnique({
      where: { id_address: parseInt(addressId) },
      select: { id_user: true },
    });

    if (!address || (userId && address.id_user !== userId)) {
      console.error("[API Checkout] Adresse invalide:", { addressId, userId });
      return NextResponse.json(
        { error: "Adresse invalide ou non associée à l'utilisateur" },
        { status: 400 }
      );
    }
    console.log("[API Checkout] Adresse validée:", { addressId, id_user: address.id_user });

    // Calculer le montant total
    console.log("[API Checkout] Calcul du montant total...");
    const totalAmount = Number(
      cartItems
        .reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)
        .toFixed(2)
    );
    console.log("[API Checkout] Montant total calculé:", totalAmount);

    // Valider le montant
    if (totalAmount <= 0 || isNaN(totalAmount)) {
      console.error("[API Checkout] Montant total invalide:", { totalAmount });
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
      if (!["ONE_TIME", "MONTHLY", "YEARLY"].includes(item.subscription)) {
        console.error("[API Checkout] Type de subscription invalide:", { subscription: item.subscription });
        return NextResponse.json(
          { error: "Type de subscription invalide dans le panier" },
          { status: 400 }
        );
      }
    }

    // Consolider les orderItems
    console.log("[API Checkout] Consolidation des orderItems...");
    const consolidatedItems = cartItems.reduce((acc: any[], item: any) => {
      const existing = acc.find(
        (i: any) => i.id_product === parseInt(item.id) && i.subscription_type === item.subscription
      );
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        acc.push({
          id_product: parseInt(item.id),
          quantity: item.quantity,
          unit_price: item.price,
          subscription_type: item.subscription,
          subscription_status: "ACTIVE",
          subscription_duration: item.subscription === "MONTHLY" ? 12 : 1,
        });
      }
      return acc;
    }, []);
    console.log("[API Checkout] OrderItems consolidés:", JSON.stringify(consolidatedItems, null, 2));

    // Créer le PaymentIntent
    console.log("[API Checkout] Création du PaymentIntent:", {
      amount: Math.round(totalAmount * 100),
      payment_method: paymentInfo.stripe_payment_id,
      customer: customerId,
    });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "eur",
      payment_method: paymentInfo.stripe_payment_id,
      customer: customerId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: { userId: userId?.toString() || guestId },
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
      id_user: userId,
      id_address: parseInt(addressId),
      total_amount: totalAmount,
      subtotal: totalAmount,
      payment_method: "card",
      last_card_digits: paymentInfo.last_card_digits || "4242",
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
    });
    console.log("[API Checkout] Commande créée:", { id_order: order.id_order });

    console.log("[API Checkout] Paiement réussi:", {
      orderId: order.id_order,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });

    return NextResponse.json({
      orderId: order.id_order,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
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
  }
}