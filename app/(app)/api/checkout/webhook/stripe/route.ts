import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(request: Request) {
  try {
    const buf = Buffer.from(await request.arrayBuffer());
    const sig = request.headers.get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      const order = await prisma.order.findUnique({
        where: { id_order: parseInt(orderId || '') },
        include: { order_items: { include: { product: true } }, address: true, user: true },
      });

      if (order) {
        await prisma.order.update({
          where: { id_order: order.id_order },
          data: { order_status: 'COMPLETED' },
        });

        await prisma.orderItem.updateMany({
          where: { id_order: order.id_order },
          data: { subscription_status: 'ACTIVE' },
        });

        const email = order.user?.email || session.customer_details?.email || 'guest@example.com';
        await resend.emails.send({
          from: 'no-reply@votre-domaine.com',
          to: email,
          subject: 'Confirmation de votre commande',
          html: `
            <h1>Merci pour votre achat !</h1>
            <p>Commande #${order.invoice_number}</p>
            <h2>Récapitulatif</h2>
            <ul>
              ${order.order_items.map(
                (item) => `
                <li>${item.product.name} - ${item.unit_price}€ (${item.subscription_type}, ${item.quantity} unité(s))</li>
              `
              ).join('')}
            </ul>
            <p>Adresse: ${order.address.address1}, ${order.address.city}, ${order.address.country}</p>
            <p>Paiement: Carte **** ${order.last_card_digits}</p>
            <p>Total: ${order.total_amount}€ (incl. ${order.total_amount - order.subtotal}€ de taxes)</p>
          `,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Erreur de webhook:', error);
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 });
  }
}