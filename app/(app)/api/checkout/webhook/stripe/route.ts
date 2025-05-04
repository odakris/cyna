import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { PDFDocument, rgb } from 'pdf-lib';

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

      if (!orderId) {
        console.error('[Webhook] orderId manquant dans metadata');
        return NextResponse.json({ error: 'orderId manquant' }, { status: 400 });
      }

      const order = await prisma.order.findUnique({
        where: { id_order: parseInt(orderId) },
        include: {
          order_items: { include: { product: true } },
          address: true,
          user: true,
        },
      });

      if (!order) {
        console.error('[Webhook] Commande non trouvée:', orderId);
        return NextResponse.json({ error: 'Commande non trouvée' }, { status: 400 });
      }

      // Mettre à jour l'ordre
      await prisma.order.update({
        where: { id_order: order.id_order },
        data: {
          order_status: 'COMPLETED',
        },
      });

      // Mettre à jour les items
      await prisma.orderItem.updateMany({
        where: { id_order: order.id_order },
        data: { subscription_status: 'ACTIVE' },
      });

      // Générer la facture PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { width, height } = page.getSize();
      const fontSize = 12;

      page.drawText('Facture', { x: 50, y: height - 50, size: 20, color: rgb(0, 0, 0) });
      page.drawText(`Numéro de facture: ${order.invoice_number}`, {
        x: 50,
        y: height - 80,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: height - 100,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Client: ${order.user?.email || session.metadata?.guestEmail}`, {
        x: 50,
        y: height - 120,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      page.drawText('Articles:', { x: 50, y: height - 160, size: fontSize, color: rgb(0, 0, 0) });
      let y = height - 180;
      order.order_items.forEach((item) => {
        page.drawText(
          `${item.product.name} (x${item.quantity}, ${item.subscription_type}): ${(
            item.unit_price * item.quantity
          ).toFixed(2)} €`,
          { x: 50, y, size: fontSize, color: rgb(0, 0, 0) }
        );
        y -= 20;
      });

      page.drawText(`Sous-total: ${order.subtotal.toFixed(2)} €`, {
        x: 50,
        y: y - 20,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Taxes (20%): ${(order.total_amount - order.subtotal).toFixed(2)} €`, {
        x: 50,
        y: y - 40,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(`Total: ${order.total_amount.toFixed(2)} €`, {
        x: 50,
        y: y - 60,
        size: fontSize,
        color: rgb(0, 0, 0),
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = Buffer.from(pdfBytes).toString('base64');

      // Envoyer l'e-mail
      const email = order.user?.email || session.metadata?.guestEmail || session.customer_details?.email;
      if (email) {
        await resend.emails.send({
          from: 'no-reply@votre-domaine.com',
          to: email,
          subject: `Confirmation de votre commande #${order.invoice_number}`,
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
            <p>Total: ${order.total_amount.toFixed(2)}€ (incl. ${(order.total_amount - order.subtotal).toFixed(2)}€ de taxes)</p>
          `,
          attachments: [
            {
              filename: `facture-${order.invoice_number}.pdf`,
              content: pdfBase64,
              contentType: 'application/pdf',
            },
          ],
        });
      }


      return NextResponse.json({ received: true });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Erreur:', error);
    return NextResponse.json({ error: 'Webhook invalide' }, { status: 400 });
  }
}