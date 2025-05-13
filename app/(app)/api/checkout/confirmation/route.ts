import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
});

// Définir les types d'abonnement valides
const VALID_SUBSCRIPTION_TYPES = ['MONTHLY', 'YEARLY', 'PER_USER', 'PER_MACHINE'];

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

    // Valider les paramètres
    if (!paymentIntentId) {
      // console.error('[API Checkout Confirmation] payment_intent_id manquant');
      return NextResponse.json(
        { error: 'Identifiant de PaymentIntent requis' },
        { status: 400 }
      );
    }

    if (!addressId || !paymentId) {
      // console.error('[API Checkout Confirmation] addressId ou paymentId manquant');
      return NextResponse.json(
        { error: 'Adresse et moyen de paiement requis' },
        { status: 400 }
      );
    }

    // Récupérer cartItems du corps de la requête
    const { cartItems } = await request.json();
    console.log('[API Checkout Confirmation] Éléments du panier reçus:', {
      count: cartItems?.length || 0,
      cartItems,
    });

    // Valider cartItems
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      // console.error('[API Checkout Confirmation] Panier vide ou invalide:', { cartItems });
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    // Valider chaque élément du panier
    for (const item of cartItems) {
      if (
        !item.id ||
        typeof item.price !== 'number' ||
        typeof item.quantity !== 'number' ||
        !VALID_SUBSCRIPTION_TYPES.includes(item.subscription_type)
      ) {
        // console.error('[API Checkout Confirmation] Élément de panier invalide:', item);
        return NextResponse.json(
          { error: 'Un ou plusieurs éléments du panier sont invalides' },
          { status: 400 }
        );
      }
    }

    // Valider le PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      /*console.error('[API Checkout Confirmation] Paiement non confirmé:', {
        status: paymentIntent.status,
      });*/
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
      // console.error('[API Checkout Confirmation] sessionToken, guestId ou userId manquant');
      return NextResponse.json(
        { error: 'Session utilisateur ou invité requise' },
        { status: 400 }
      );
    }

    // Déterminer userIdToUse
    let userIdToUse = userId ? parseInt(userId) : parsedGuestId;
    if (!userIdToUse) {
      // console.error('[API Checkout Confirmation] Aucun utilisateur associé');
      return NextResponse.json(
        { error: 'Utilisateur non trouvé pour la commande' },
        { status: 400 }
      );
    }

    // Valider paymentInfo
    const paymentInfo = await prisma.paymentInfo.findUnique({
      where: { id_payment_info: parseInt(paymentId) },
    });
    if (!paymentInfo || paymentInfo.id_user !== userIdToUse) {
      /*console.error('[API Checkout Confirmation] Moyen de paiement non trouvé ou non associé:', {
        paymentId,
        userId: userIdToUse,
      });*/
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
      /*console.error('[API Checkout Confirmation] Adresse non trouvée ou non associée:', {
        addressId,
        userId: userIdToUse,
      });*/
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
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    console.log('[API Checkout Confirmation] Génération de la commande:', {
      invoiceNumber,
    });

    // Vérifier si la commande existe déjà (pour éviter les doublons)
    const existingOrder = await prisma.order.findFirst({
      where: {
        id_user: userIdToUse,
        id_address: parseInt(addressId),
        invoice_number: { startsWith: `INV-${Date.now()}` }, // Approximation basée sur le timestamp
      },
    });

    let order;
    if (existingOrder) {
      console.log('[API Checkout Confirmation] Commande existante trouvée:', {
        orderId: existingOrder.id_order,
      });
      order = existingOrder;
    } else {
      // Créer la commande avec invoice_pdf_url
      order = await prisma.order.create({
        data: {
          id_user: userIdToUse,
          id_address: parseInt(addressId),
          total_amount: totalAmount,
          subtotal: totalAmount,
          payment_method: 'card',
          last_card_digits: paymentInfo.last_card_digits || null,
          invoice_number: invoiceNumber,
          invoice_pdf_url: `/api/invoices/${order?.id_order || 'TEMP'}/download`, // Placeholder temporaire
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

      // Mettre à jour invoice_pdf_url avec le véritable id_order
      await prisma.order.update({
        where: { id_order: order.id_order },
        data: { invoice_pdf_url: `/api/invoices/${order.id_order}/download` },
      });
    }

    // Vérifier que invoice_pdf_url est enregistré
    const savedOrder = await prisma.order.findUnique({
      where: { id_order: order.id_order },
      select: { invoice_pdf_url: true },
    });

    console.log('[API Checkout Confirmation] Commande confirmée:', {
      orderId: order.id_order,
      invoiceNumber,
      invoice_pdf_url: savedOrder.invoice_pdf_url,
    });

    // Nettoyer le panier (optionnel, si utilisé côté serveur)
    await prisma.cartItem.deleteMany({
      where: { userId_user: userIdToUse },
    });

    return NextResponse.json({
      id_order: order.id_order.toString(),
      total_amount: order.total_amount,
      order_date: order.order_date,
      invoice_number: order.invoice_number,
      invoice_pdf_url: savedOrder.invoice_pdf_url,
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
    /*console.error('[API Checkout Confirmation] Erreur:', {
      message: error.message,
      stack: error.stack,
      details: JSON.stringify(error, null, 2),
    });*/
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation de la commande', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}