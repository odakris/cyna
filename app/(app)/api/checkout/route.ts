import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(request: Request) {
  const headers = request.headers;
  const userId = headers.get('x-user-id');
  const guestId = headers.get('x-guest-id');

  let cartItems, addressId, paymentId, totalAmount;
  try {
    const body = await request.json();
    cartItems = body.cartItems;
    addressId = body.addressId;
    paymentId = body.paymentId;
    totalAmount = body.totalAmount;
  } catch (error) {
    console.error('[API/Checkout] Erreur de parsing JSON:', error);
    return NextResponse.json(
      { error: 'Données invalides', details: 'Corps de la requête mal formé' },
      { status: 400 }
    );
  }

  console.log('[API/Checkout] Requête reçue:', { userId, guestId, paymentId, totalAmount });

  if (!userId && !guestId) {
    return NextResponse.json(
      { error: 'Authentification requise', details: 'x-user-id ou x-guest-id manquant' },
      { status: 401 }
    );
  }

  if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
    return NextResponse.json(
      { error: 'Données invalides', details: 'paymentId est requis et doit être une chaîne non vide' },
      { status: 400 }
    );
  }

  if (!addressId || !cartItems || !totalAmount || totalAmount <= 0) {
    return NextResponse.json(
      { error: 'Données invalides', details: 'addressId, cartItems, et totalAmount sont requis' },
      { status: 400 }
    );
  }

  try {
    if (userId) {
      if (isNaN(parseInt(paymentId))) {
        return NextResponse.json(
          {
            error: 'Données invalides',
            details: 'paymentId doit être une chaîne numérique pour les utilisateurs connectés',
          },
          { status: 400 }
        );
      }

      const paymentInfo = await prisma.paymentInfo.findFirst({
        where: {
          id_payment_info: parseInt(paymentId),
          id_user: parseInt(userId),
        },
      });

      if (!paymentInfo || !paymentInfo.stripe_payment_id) {
        return NextResponse.json(
          {
            error: 'Moyen de paiement introuvable',
            details: `Aucun moyen de paiement trouvé pour paymentId: ${paymentId}`,
          },
          { status: 404 }
        );
      }

      console.log('[API/Checkout] PaymentInfo récupéré:', {
        paymentId,
        stripe_payment_id: paymentInfo.stripe_payment_id,
      });

      // Optionnel : récupérer le customer lié au paymentMethod
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentInfo.stripe_payment_id);
      const customerId = paymentMethod.customer as string | null;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'eur',
        payment_method_types: ['card'],
        payment_method: paymentInfo.stripe_payment_id,
        customer: customerId || undefined,
        confirmation_method: 'automatic',
        confirm: false,
      });

      console.log('[API/Checkout] PaymentIntent créé:', {
        id: paymentIntent.id,
        status: paymentIntent.status,
      });

      return NextResponse.json(
        { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id },
        { status: 200 }
      );
    } else {
      // Mode invité
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency: 'eur',
        payment_method_types: ['card'],
        confirmation_method: 'automatic',
        confirm: false,
      });

      console.log('[API/Checkout] PaymentIntent créé (invité):', {
        clientSecret: paymentIntent.client_secret,
      });

      return NextResponse.json({ clientSecret: paymentIntent.client_secret }, { status: 200 });
    }
  } catch (error: any) {
    console.error('[API/Checkout] Erreur:', error);
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: 'Erreur Stripe', details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
