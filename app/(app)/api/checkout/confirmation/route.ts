import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: NextRequest) {
  try {
    console.log('[API Checkout Confirmation] Début de la requête POST');
    const url = new URL(request.url);
    const stripeSessionId = url.searchParams.get('session_id');
    const addressId = url.searchParams.get('addressId');
    const paymentId = url.searchParams.get('paymentId');
    const guestId = url.searchParams.get('guestId');
    const userId = request.headers.get('x-user-id');

    console.log('[API Checkout Confirmation] Paramètres reçus:', {
      stripeSessionId,
      addressId,
      paymentId,
      guestId,
      userId,
    });

    if (!stripeSessionId) {
      console.error('[API Checkout Confirmation] session_id manquant');
      return NextResponse.json(
        { error: 'Identifiant de session Stripe requis' },
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

    const stripeSession = await stripe.checkout.sessions.retrieve(stripeSessionId);
    if (stripeSession.payment_status !== 'paid') {
      console.error('[API Checkout Confirmation] Paiement non confirmé:', {
        payment_status: stripeSession.payment_status,
      });
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      );
    }

    const metadata = stripeSession.metadata;
    console.log('[API Checkout Confirmation] Métadonnées extraites:', metadata);

    const sessionToken = metadata?.sessionToken;
    const guestEmail = metadata?.guestEmail;
    const parsedGuestId = metadata?.guestId ? parseInt(metadata.guestId) : undefined;

    if (!sessionToken && !parsedGuestId) {
      console.error('[API Checkout Confirmation] sessionToken ou guestId manquant dans metadata');
      return NextResponse.json(
        { error: 'Session utilisateur ou invité requise' },
        { status: 400 }
      );
    }

    let cartItems;
    if (parsedGuestId && !userId) {
      console.log('[API Checkout Confirmation] Recherche panier pour invité:', {
        guestId: parsedGuestId,
      });
      cartItems = await prisma.cartItem.findMany({
        where: { sessionId_session: parsedGuestId },
      });
    } else if (userId) {
      console.log('[API Checkout Confirmation] Recherche panier pour utilisateur:', { userId });
      cartItems = await prisma.cartItem.findMany({
        where: { userId_user: parseInt(userId) },
      });
    } else {
      console.error('[API Checkout Confirmation] Aucun utilisateur ou invité identifié');
      return NextResponse.json(
        { error: 'Utilisateur ou invité non identifié' },
        { status: 400 }
      );
    }

    console.log('[API Checkout Confirmation] Éléments du panier:', {
      count: cartItems.length,
    });

    if (!cartItems || cartItems.length === 0) {
      console.error('[API Checkout Confirmation] Panier vide');
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    const paymentInfo = await prisma.paymentInfo.findUnique({
      where: { id_payment_info: parseInt(paymentId) },
    });
    if (!paymentInfo) {
      console.error('[API Checkout Confirmation] Moyen de paiement non trouvé:', { paymentId });
      return NextResponse.json(
        { error: 'Moyen de paiement non trouvé' },
        { status: 404 }
      );
    }

    const address = await prisma.address.findUnique({
      where: { id_address: parseInt(addressId) },
    });
    if (!address) {
      console.error('[API Checkout Confirmation] Adresse non trouvée:', { addressId });
      return NextResponse.json({ error: 'Adresse non trouvée' }, { status: 404 });
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      let unitPrice = item.price;
      if (item.subscription_type === 'YEARLY') {
        unitPrice *= 12;
      }
      return sum + unitPrice * item.quantity;
    }, 0);

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoicePath = `/invoices/${invoiceNumber}.pdf`;
    const fullPath = path.join(process.cwd(), 'public', invoicePath);

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    const doc = new PDFDocument();
    const stream = require('fs').createWriteStream(fullPath);
    doc.pipe(stream);

    doc.fontSize(20).text('Facture', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Numéro de facture: ${invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text('Adresse de facturation:');
    doc.text(address.address1);
    if (address.address2) doc.text(address.address2);
    doc.text(`${address.city}, ${address.postal_code}, ${address.country}`);
    doc.moveDown();
    doc.text('Articles:');
    cartItems.forEach((item) => {
      const unitPrice = item.subscription_type === 'YEARLY' ? item.price * 12 : item.price;
      doc.text(`${item.name} - Quantité: ${item.quantity} - Prix: ${unitPrice.toFixed(2)} €`);
    });
    doc.moveDown();
    doc.text(`Total: ${totalAmount.toFixed(2)} €`);
    doc.end();

    await new Promise((resolve) => stream.on('finish', resolve));

    const userIdToUse = userId ? parseInt(userId) : (await prisma.session.findUnique({ where: { id_session: parsedGuestId } }))?.id_user;
    if (!userIdToUse) {
      console.error('[API Checkout Confirmation] Aucun utilisateur associé');
      return NextResponse.json(
        { error: 'Utilisateur non trouvé pour la commande' },
        { status: 400 }
      );
    }

    const order = await prisma.order.create({
      data: {
        id_user: userIdToUse,
        id_address: parseInt(addressId),
        total_amount: totalAmount,
        subtotal: totalAmount,
        payment_method: paymentInfo.card_name,
        last_card_digits: paymentInfo.last_card_digits,
        invoice_number: invoiceNumber,
        invoice_pdf_url: invoicePath,
        order_status: 'CONFIRMED',
        order_items: {
          create: cartItems.map((item) => ({
            id_product: parseInt(item.id),
            quantity: item.quantity,
            unit_price: item.price,
            subscription_type: item.subscription_type,
          })),
        },
      },
      include: {
        address: true,
        order_items: true,
      },
    });

    if (parsedGuestId) {
      await prisma.cartItem.deleteMany({
        where: { sessionId_session: parsedGuestId },
      });
    } else if (userId) {
      await prisma.cartItem.deleteMany({
        where: { userId_user: parseInt(userId) },
      });
    }

    console.log('[API Checkout Confirmation] Commande créée:', {
      orderId: order.id_order,
      invoiceNumber,
    });

    return NextResponse.json({
      id_order: order.id_order.toString(),
      total_amount: order.total_amount,
      order_date: order.order_date,
      invoice_number: order.invoice_number,
      payment_method: order.payment_method,
      last_card_digits: order.last_card_digits,
      address: {
        address1: order.address.address1,
        address2: order.address.address2,
        city: order.address.city,
        postal_code: order.address.postal_code,
        country: order.address.country,
      },
      order_items: order.order_items.map((item) => ({
        name: item.name || `Produit ${item.id_product}`,
        quantity: item.quantity,
        price: item.unit_price,
        subscription_type: item.subscription_type,
      })),
    });
  } catch (error: any) {
    console.error('[API Checkout Confirmation] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation de la commande', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}