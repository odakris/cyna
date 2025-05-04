import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-mail requis' },
        { status: 400 }
      );
    }

    const customer = await stripe.customers.create({
      email,
      name,
    });

    console.log('[API Stripe Create Customer] Client créé:', {
      customerId: customer.id,
      email,
    });

    return NextResponse.json({
      customerId: customer.id,
    });
  } catch (error: any) {
    console.error('[API Stripe Create Customer] Erreur:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création du client Stripe',
        details: error.message || 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}