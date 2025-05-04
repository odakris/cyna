import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

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

    console.log("[API Checkout] Récupération de l'utilisateur pour userId:", userId || guestId);
    const user = await prisma.user.findUnique({
      where: { id_user: userId || guestId },
      select: { stripeCustomerId: true },
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

    // Vérifier que l'adresse existe
    console.log("[API Checkout] Récupération de l'adresse pour addressId:", addressId);
    const address = await prisma.address.findUnique({
      where: { id_address: parseInt(addressId) },
      select: { id_user: true },
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
      // Vérifier subscription_type
      if (!VALID_SUBSCRIPTION_TYPES.includes(item.subscription_type)) {
        console.error("[API Checkout] Type de subscription invalide:", { subscription_type: item.subscription_type });
        return NextResponse.json(
          { error: `Type de subscription invalide: ${item.subscription_type}. Valeurs attendues: ${VALID_SUBSCRIPTION_TYPES.join(", ")}` },
          { status: 400 }
        );
      }
      // Vérifier la cohérence entre subscription et subscription_type
      if (item.subscription && item.subscription !== item.subscription_type) {
        console.warn("[API Checkout] Incohérence subscription/subscription_type:", {
          subscription: item.subscription,
          subscription_type: item.subscription_type,
        });
        item.subscription = item.subscription_type; // Corriger subscription
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
      metadata: { userId: (userId || guestId).toString() },
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
  } finally {
    await prisma.$disconnect();
  }
}