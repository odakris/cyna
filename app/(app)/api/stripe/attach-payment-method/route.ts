import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(request: Request) {
  try {
    const { paymentMethodId, customerId } = await request.json();

    if (!paymentMethodId || !customerId) {
      return NextResponse.json(
        { error: 'paymentMethodId ou customerId manquant' },
        { status: 400 }
      );
    }

    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    console.log('[API Stripe Attach Payment Method] Payment method attaché:', {
      paymentMethodId,
      customerId,
    });

    return NextResponse.json({
      paymentMethodId: paymentMethod.id,
    });
  } catch (error: any) {
    // console.error('[API Stripe Attach Payment Method] Erreur:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de l’attachement du moyen de paiement',
        details: error.message || 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}