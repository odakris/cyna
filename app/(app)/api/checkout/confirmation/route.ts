import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API Checkout Confirmation] Début de la requête POST');
    const url = new URL(request.url);
    const paymentIntentId = url.searchParams.get('payment_intent_id');
    const addressId = url.searchParams.get('addressId');
    const paymentId = url.searchParams.get('paymentId');
    const guestId = url.searchParams.get('guestId');
    const userId = request.headers.get('x-user-id');

    console.log('[API Checkout Confirmation] Paramètres reçus:', {
      paymentIntentId,
      addressId,
      paymentId,
      guestId,
      userId,
    });

    if (!paymentIntentId) {
      console.error('[API Checkout Confirmation] payment_intent_id manquant');
      return NextResponse.json(
        { error: 'Identifiant de PaymentIntent requis' },
        { status: 400 }
      );
    }

    if (!addressId || !paymentId) {
      console.error('[API Checkout Confirmation] addressId ou paymentId manquant');
      return NextResponse.json(
        { error: 'Adresse et moyen de paiement requis' },
        { status: 400 }
      );
    }

    // Valider le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      console.error('[API Checkout Confirmation] Paiement non confirmé:', {
        status: paymentIntent.status,
      });
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      );
    }

    const metadata = paymentIntent.metadata;
    console.log('[API Checkout Confirmation] Métadonnées extraites:', metadata);

    const sessionToken = metadata?.sessionToken;
    const guestEmail = metadata?.guestEmail;
    const parsedGuestId = metadata?.guestId ? parseInt(metadata.guestId) : undefined;

    if (!sessionToken && !parsedGuestId && !userId) {
      console.error('[API Checkout Confirmation] sessionToken, guestId ou userId manquant');
      return NextResponse.json(
        { error: 'Session utilisateur ou invité requise' },
        { status: 400 }
      );
    }

    // Déterminer userIdToUse
    let userIdToUse = userId ? parseInt(userId) : parsedGuestId;
    if (!userIdToUse) {
      console.error('[API Checkout Confirmation] Aucun utilisateur associé');
      return NextResponse.json(
        { error: 'Utilisateur non trouvé pour la commande' },
        { status: 400 }
      );
    }

    // Récupérer les éléments du panier
    console.log('[API Checkout Confirmation] Recherche panier pour utilisateur:', { userId: userIdToUse });
    const cartItems = await prisma.cartItem.findMany({
      where: { userId_user: userIdToUse },
    });

    console.log('[API Checkout Confirmation] Éléments du panier:', {
      count: cartItems.length,
    });

    if (!cartItems || cartItems.length === 0) {
      console.error('[API Checkout Confirmation] Panier vide');
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    // Valider paymentInfo
    const paymentInfo = await prisma.paymentInfo.findUnique({
      where: { id_payment_info: parseInt(paymentId) },
    });
    if (!paymentInfo || paymentInfo.id_user !== userIdToUse) {
      console.error('[API Checkout Confirmation] Moyen de paiement non trouvé ou non associé:', { paymentId, userId: userIdToUse });
      return NextResponse.json(
        { error: 'Moyen de paiement non trouvé ou non associé à l’utilisateur' },
        { status: 404 }
      );
    }

    // Valider l'adresse
    const address = await prisma.address.findUnique({
      where: { id_address: parseInt(addressId) },
    });
    if (!address || address.id_user !== userIdToUse) {
      console.error('[API Checkout Confirmation] Adresse non trouvée ou non associée:', { addressId, userId: userIdToUse });
      return NextResponse.json(
        { error: 'Adresse non trouvée ou non associée à l’utilisateur' },
        { status: 404 }
      );
    }

    // Calculer le montant total
    const totalAmount = cartItems.reduce((sum, item) => {
      let unitPrice = item.price;
      if (item.subscription_type === 'YEARLY') {
        unitPrice *= 12;
      }
      return sum + unitPrice * item.quantity;
    }, 0);

    // Générer invoice_number
    const invoiceNumber = `INV-${Date.now()}-s${Math.random().toString(36).slice(2, 8)}`;
    const invoicePdfUrl = `/api/invoice/download?invoice_number=${invoiceNumber}`;

    console.log('[API Checkout Confirmation] Génération de la commande:', {
      invoiceNumber,
      invoicePdfUrl,
    });

    // Créer la commande avec invoice_pdf_url
    const order = await prisma.order.create({
      data: {
        id_user: userIdToUse,
        id_address: parseInt(addressId),
        total_amount: totalAmount,
        subtotal: totalAmount,
        payment_method: 'card',
        last_card_digits: paymentInfo.last_card_digits || null,
        invoice_number: invoiceNumber,
        invoice_pdf_url: invoicePdfUrl,
        order_status: 'COMPLETED',
        order_items: {
          create: cartItems.map((item) => ({
            id_product: parseInt(item.id),
            quantity: item.quantity,
            unit_price: item.price,
            subscription_type: item.subscription_type,
            subscription_status: 'ACTIVE',
            subscription_duration: item.subscription_type === 'MONTHLY' ? 12 : 1,
          })),
        },
      },
      include: {
        address: true,
        order_items: true,
      },
    });

    // Vérifier que invoice_pdf_url est enregistré
    const savedOrder = await prisma.order.findUnique({
      where: { id_order: order.id_order },
      select: { invoice_pdf_url: true },
    });

    console.log('[API Checkout Confirmation] Commande créée:', {
      orderId: order.id_order,
      invoiceNumber,
      invoice_pdf_url: savedOrder.invoice_pdf_url,
    });

    // Nettoyer le panier
    await prisma.cartItem.deleteMany({
      where: { userId_user: userIdToUse },
    });

    return NextResponse.json({
      id_order: order.id_order.toString(),
      total_amount: order.total_amount,
      order_date: order.order_date,
      invoice_number: order.invoice_number,
      invoice_pdf_url: order.invoice_pdf_url,
      payment_method: order.payment_method,
      last_card_digits: order.last_card_digits,
      address: {
        address1: order.address.address1,
        address2: order.address.address2,
        city: order.address.city,
        postal_code: order.address.postal_code,
        country: order.address.country,
        first_name: order.address.first_name,
        last_name: order.address.last_name,
      },
      order_items: order.order_items.map((item) => ({
        id_product: item.id_product,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subscription_type: item.subscription_type,
        subscription_duration: item.subscription_duration,
      })),
    });
  } catch (error: any) {
    console.error('[API Checkout Confirmation] Erreur:', {
      message: error.message,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation de la commande', details: error.message },
      { status: 500 }
    );
  }
}