import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
  try {
    const { sessionToken, cart } = await request.json();
    console.log('[API] Requête reçue:', { sessionToken, cartLength: cart?.length });

    if (!sessionToken) {
      console.error('[API] sessionToken manquant');
      return NextResponse.json({ message: 'sessionToken requis' }, { status: 400 });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      console.error('[API] Panier vide ou invalide');
      return NextResponse.json({ message: 'Panier vide ou invalide' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.map((item: any) => {
        let unitAmount = item.price;
        switch (item.subscription) {
          case 'YEARLY':
            unitAmount = item.price * 12;
            break;
          case 'MONTHLY':
          case 'PER_USER':
          case 'PER_MACHINE':
            unitAmount = item.price;
            break;
          default:
            unitAmount = item.price;
        }
        return {
          price_data: {
            currency: 'eur',
            product_data: {
              name: item.name,
              metadata: { subscription: item.subscription || 'MONTHLY' },
            },
            unit_amount: Math.round(unitAmount * 100),
          },
          quantity: item.quantity,
        };
      }),
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/payment/success`,
      cancel_url: `${request.headers.get('origin')}/payment/cancel`,
    });

    console.log('[API] Session Stripe créée:', session.id);
    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error('[API] Erreur:', error);
    return NextResponse.json(
      { message: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}