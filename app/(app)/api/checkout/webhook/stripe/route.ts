import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CheckoutController } from '../../../../../../lib/controllers/CheckoutController';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
  try {
    // Lire le corps brut de la requête
    const buf = Buffer.from(await request.arrayBuffer());
    const sig = request.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    // Vérifier l'événement webhook
    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

    // Simuler une requête compatible avec CheckoutController
    const req = { body: event } as any; // Adapter selon CheckoutController
    const res = {
      status: (code: number) => ({
        json: (data: any) => NextResponse.json(data, { status: code }),
      }),
    } as any;

    const controller = new CheckoutController();
    return controller.handleWebhook(req, res);
  } catch (error) {
    console.error('Erreur de vérification du webhook:', error);
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 });
  }
}