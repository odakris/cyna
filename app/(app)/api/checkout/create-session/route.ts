import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
  try {
    const { sessionToken, cart, addressId, paymentId, guestEmail, guestAddress, guestPayment } =
      await request.json();
    console.log('[API Checkout] Requête reçue:', {
      sessionToken,
      cartLength: cart?.length,
      addressId,
      paymentId,
      guestEmail,
    });

    if (!cart || cart.length === 0) {
      console.error('[API Checkout] Panier vide ou invalide');
      return NextResponse.json({ message: 'Panier vide ou invalide' }, { status: 400 });
    }

    let customerId: string;
    let addressData: any;
    let paymentMethodId: string;

    if (sessionToken) {
      // Utilisateur connecté
      if (!addressId || !paymentId) {
        console.error('[API Checkout] Adresse ou moyen de paiement manquant');
        return NextResponse.json(
          { message: 'Adresse et moyen de paiement requis' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id_user: parseInt(sessionToken) },
        select: { stripeCustomerId: true },
      });

      if (!user || !user.stripeCustomerId) {
        console.error('[API Checkout] Utilisateur ou client Stripe non trouvé');
        return NextResponse.json({ message: 'Utilisateur invalide' }, { status: 400 });
      }
      customerId = user.stripeCustomerId;

      const address = await prisma.address.findUnique({
        where: { id_address: parseInt(addressId) },
      });
      if (!address) {
        console.error('[API Checkout] Adresse non trouvée');
        return NextResponse.json({ message: 'Adresse non trouvée' }, { status: 400 });
      }
      addressData = {
        name: `${address.first_name} ${address.last_name}`,
        address: {
          line1: address.address1,
          line2: address.address2 || undefined,
          postal_code: address.postal_code,
          city: address.city,
          country: address.country,
        },
        phone: address.mobile_phone,
      };

      const paymentInfo = await prisma.paymentInfo.findUnique({
        where: { id_payment_info: parseInt(paymentId) },
      });
      if (!paymentInfo || !paymentInfo.stripe_payment_id) {
        console.error('[API Checkout] Moyen de paiement non trouvé');
        return NextResponse.json({ message: 'Moyen de paiement non trouvé' }, { status: 400 });
      }
      paymentMethodId = paymentInfo.stripe_payment_id;
    } else if (guestEmail && guestAddress && guestPayment) {
      // Utilisateur invité
      const customer = await stripe.customers.create({
        email: guestEmail,
        name: `${guestAddress.first_name} ${guestAddress.last_name}`,
        address: {
          line1: guestAddress.address1,
          line2: guestAddress.address2 || undefined,
          postal_code: guestAddress.postal_code,
          city: guestAddress.city,
          country: guestAddress.country,
        },
        phone: guestAddress.mobile_phone,
      });
      customerId = customer.id;

      addressData = {
        name: `${guestAddress.first_name} ${guestAddress.last_name}`,
        address: {
          line1: guestAddress.address1,
          line2: guestAddress.address2 || undefined,
          postal_code: guestAddress.postal_code,
          city: guestAddress.city,
          country: guestAddress.country,
        },
        phone: guestAddress.mobile_phone,
      };

      paymentMethodId = guestPayment.stripe_payment_id;
    } else {
      console.error('[API Checkout] Données utilisateur ou invité manquantes');
      return NextResponse.json(
        { message: 'Données utilisateur ou invité manquantes' },
        { status: 400 }
      );
    }

    const lineItems = cart.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.product.name,
          metadata: {
            productId: item.product.id,
            subscriptionType: item.subscriptionType,
          },
        },
        unit_amount: Math.round(item.product.unitPrice * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      payment_method: paymentMethodId,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'US', 'CA', 'GB', 'DE'],
      },
      metadata: {
        sessionToken: sessionToken || 'guest',
        addressId: addressId?.toString() || 'guest',
        paymentId: paymentId?.toString() || 'guest',
        guestEmail: guestEmail || '',
      },
    });

    console.log('[API Checkout] Session Stripe créée:', { sessionId: session.id });

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error: any) {
    console.error('[API Checkout] Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la session de paiement', error: error.message },
      { status: 500 }
    );
  }
}