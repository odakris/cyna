import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API Checkout] Début de la requête POST');

    const { cartItems, addressId, paymentId, guestId, guestEmail, sessionToken, stripe_payment_id } = await request.json();
    console.log('[API Checkout] Données reçues:', {
      cartItemsCount: cartItems?.length,
      addressId,
      paymentId,
      guestId,
      guestEmail,
      sessionToken,
      stripe_payment_id,
    });

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error('[API Checkout] Panier vide ou invalide');
      return NextResponse.json({ error: 'Panier requis' }, { status: 400 });
    }

    if (!addressId || !paymentId) {
      console.error('[API Checkout] addressId ou paymentId manquant');
      return NextResponse.json({ error: 'Adresse et moyen de paiement requis' }, { status: 400 });
    }

    // Vérifier l'adresse
    let parsedAddressId: number;
    try {
      parsedAddressId = parseInt(addressId);
    } catch {
      console.error('[API Checkout] addressId non numérique:', { addressId });
      return NextResponse.json({ error: 'ID d\'adresse invalide' }, { status: 400 });
    }

    const address = await prisma.address.findUnique({
      where: { id_address: parsedAddressId },
    });
    if (!address) {
      console.error('[API Checkout] Adresse non trouvée:', { addressId });
      return NextResponse.json({ error: 'Adresse non trouvée' }, { status: 404 });
    }

    // Vérifier le moyen de paiement
    let paymentInfo;
    let effectiveStripePaymentId = stripe_payment_id;
    if (!paymentId.startsWith('pay_')) {
      paymentInfo = await prisma.paymentInfo.findUnique({
        where: { id_payment_info: parseInt(paymentId) },
      });
      if (!paymentInfo) {
        console.error('[API Checkout] Moyen de paiement non trouvé:', { paymentId });
        return NextResponse.json({ error: 'Moyen de paiement non trouvé' }, { status: 404 });
      }
      effectiveStripePaymentId = paymentInfo.stripe_payment_id;
    } else if (!effectiveStripePaymentId) {
      console.warn('[API Checkout] Aucun stripe_payment_id fourni pour l\'invité:', { paymentId });
    }

    // Valider le moyen de paiement si présent
    if (effectiveStripePaymentId) {
      try {
        await stripe.paymentMethods.retrieve(effectiveStripePaymentId);
        console.log('[API Checkout] Moyen de paiement validé:', { effectiveStripePaymentId });
      } catch (error: any) {
        console.error('[API Checkout] Moyen de paiement invalide:', {
          effectiveStripePaymentId,
          error: error.message,
        });
        return NextResponse.json(
          { error: 'Moyen de paiement invalide ou expiré' },
          { status: 400 }
        );
      }
    }

    // Créer ou récupérer un client Stripe pour les utilisateurs connectés
    let customerId: string | undefined;
    if (sessionToken && sessionToken !== 'guest') {
      let parsedSessionToken: number;
      try {
        parsedSessionToken = parseInt(sessionToken);
      } catch {
        console.error('[API Checkout] sessionToken non numérique:', { sessionToken });
        return NextResponse.json({ error: 'Session token invalide' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id_user: parsedSessionToken },
        select: { stripeCustomerId: true, email: true },
      });
      if (!user) {
        console.error('[API Checkout] Utilisateur non trouvé:', { parsedSessionToken });
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
      }
      if (user.stripeCustomerId) {
        customerId = user.stripeCustomerId;
        // Attacher le moyen de paiement au client si nécessaire
        if (effectiveStripePaymentId) {
          try {
            await stripe.paymentMethods.attach(effectiveStripePaymentId, {
              customer: customerId,
            });
            console.log('[API Checkout] Moyen de paiement attaché au client:', {
              paymentMethod: effectiveStripePaymentId,
              customerId,
            });
            // Définir le moyen de paiement comme défaut pour le client
            await stripe.customers.update(customerId, {
              invoice_settings: {
                default_payment_method: effectiveStripePaymentId,
              },
            });
            console.log('[API Checkout] Moyen de paiement défini comme défaut:', {
              paymentMethod: effectiveStripePaymentId,
              customerId,
            });
            // Vérifier les moyens de paiement attachés
            const paymentMethods = await stripe.paymentMethods.list({
              customer: customerId,
              type: 'card',
            });
            console.log('[API Checkout] Moyens de paiement du client:', {
              customerId,
              paymentMethods: paymentMethods.data.map(pm => ({
                id: pm.id,
                last4: pm.card?.last4,
                brand: pm.card?.brand,
              })),
            });
          } catch (error: any) {
            console.error('[API Checkout] Erreur lors de l\'attachement du moyen de paiement:', {
              paymentMethod: effectiveStripePaymentId,
              customerId,
              error: error.message,
            });
            return NextResponse.json(
              { error: 'Moyen de paiement invalide ou déjà utilisé' },
              { status: 400 }
            );
          }
        }
      } else {
        const customer = await stripe.customers.create({
          email: user.email || guestEmail || 'guest@example.com',
          name: `${address.first_name} ${address.last_name}`,
          address: {
            line1: address.address1,
            line2: address.address2 || undefined,
            city: address.city,
            postal_code: address.postal_code,
            country: address.country,
          },
          payment_method: effectiveStripePaymentId,
          invoice_settings: effectiveStripePaymentId
            ? { default_payment_method: effectiveStripePaymentId }
            : undefined,
        });
        await prisma.user.update({
          where: { id_user: parsedSessionToken },
          data: { stripeCustomerId: customer.id },
        });
        customerId = customer.id;
        console.log('[API Checkout] Nouveau client créé avec moyen de paiement:', {
          customerId,
          paymentMethod: effectiveStripePaymentId || 'non spécifié',
        });
      }
    }

    const totalPrice = cartItems.reduce((sum: number, item: any) => {
      let unitPrice = item.price;
      if (item.subscription_type === 'YEARLY') {
        unitPrice *= 12;
      }
      return sum + unitPrice * item.quantity;
    }, 0);
    console.log('[API Checkout] Prix total calculé:', { totalPrice });

    // Configurer la session Stripe
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: cartItems.map((item: any) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.imageUrl ? [item.imageUrl] : [],
          },
          unit_amount: Math.round(
            (item.subscription_type === 'YEARLY' ? item.price * 12 : item.price) * 100
          ),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}&addressId=${addressId}&paymentId=${paymentId}`,
      cancel_url: `${request.headers.get('origin')}/checkout?error=canceled`,
      metadata: {
        sessionToken: sessionToken || 'guest',
        addressId: addressId.toString(),
        paymentId: paymentId.toString(),
        guestEmail: guestEmail || '',
        guestId: guestId?.toString() || '',
      },
      billing_address_collection: 'auto',
      payment_intent_data: {
        metadata: {
          paymentId: paymentId.toString(),
        },
        setup_future_usage: 'off_session', // Permet de sauvegarder le moyen de paiement pour une réutilisation
        shipping: {
          name: `${address.first_name} ${address.last_name}`,
          address: {
            line1: address.address1,
            line2: address.address2 || undefined,
            city: address.city,
            postal_code: address.postal_code,
            country: address.country,
          },
        },
      },
    };

    // Associer le client ou l'e-mail
    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = guestEmail || 'guest@example.com';
    }

    console.log('[API Checkout] Paramètres de la session Stripe:', {
      customerId,
      effectiveStripePaymentId,
    });

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log('[API Checkout] Session Stripe créée:', {
      sessionId: session.id,
      customerId,
      paymentMethod: effectiveStripePaymentId || 'non spécifié',
    });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error: any) {
    console.error('[API Checkout] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}