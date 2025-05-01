import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil', // Conserver pour le moment
});

export async function POST(req: NextRequest) {
  console.log('[API Checkout] Début de la requête POST');
  try {
    const session = await getServerSession(authOptions);
    console.log('[API Checkout] Session récupérée:', { session: !!session });

    const data = await req.json();
    const { cartItems, addressId, paymentId, totalAmount, guestUserId, guestEmail, guestName } = data;
    console.log('[API Checkout] Données reçues:', {
      cartItems: cartItems?.length,
      addressId,
      paymentId,
      totalAmount,
      guestUserId,
      guestEmail,
      guestName,
      userId: session?.user?.id_user,
    });

    // Validation des données
    if (!cartItems || !addressId || !paymentId || !totalAmount) {
      console.error('[API Checkout] Données manquantes:', { cartItems, addressId, paymentId, totalAmount });
      return NextResponse.json(
        { error: 'Données manquantes pour initialiser le paiement', missing: { cartItems, addressId, paymentId, totalAmount } },
        { status: 400 }
      );
    }

    // Vérifier la session ou le mode invité
    if (!session?.user?.id_user && !guestUserId) {
      console.error('[API Checkout] Utilisateur non connecté et pas de guestUserId');
      return NextResponse.json(
        { error: 'Utilisateur non connecté ou guestUserId manquant' },
        { status: 401 }
      );
    }

    const userId = session?.user?.id_user || guestUserId;
    console.log('[API Checkout] UserId déterminé:', { userId });

    // Récupérer les informations de paiement
    console.log('[API Checkout] Récupération de PaymentInfo:', { paymentId, userId });
    const paymentInfo = await prisma.paymentInfo.findFirst({
      where: {
        id_payment_info: parseInt(paymentId),
        id_user: parseInt(userId),
      },
    });

    if (!paymentInfo || !paymentInfo.stripe_payment_id) {
      console.error('[API Checkout] Moyen de paiement non trouvé:', { paymentId, userId, paymentInfo });
      return NextResponse.json(
        { error: 'Moyen de paiement non trouvé ou invalide' },
        { status: 404 }
      );
    }
    console.log('[API Checkout] PaymentInfo récupéré:', { stripe_payment_id: paymentInfo.stripe_payment_id });

    // Vérifier que stripe_payment_id est un payment_method valide
    if (!paymentInfo.stripe_payment_id.startsWith('pm_')) {
      console.error('[API Checkout] stripe_payment_id invalide:', {
        stripe_payment_id: paymentInfo.stripe_payment_id,
      });
      return NextResponse.json(
        { error: 'Identifiant de paiement Stripe invalide' },
        { status: 400 }
      );
    }

    // Récupérer ou créer un client Stripe
    console.log('[API Checkout] Récupération ou création du client Stripe:', { userId });
    let customerId: string;
    const user = await prisma.user.findUnique({
      where: { id_user: parseInt(userId) },
      select: { stripeCustomerId: true, email: true, first_name: true, last_name: true },
    });

    if (!user) {
      console.error('[API Checkout] Utilisateur non trouvé dans la base de données:', { userId });
      return NextResponse.json(
        { error: 'Utilisateur non trouvé dans la base de données' },
        { status: 404 }
      );
    }

    if (user.stripeCustomerId) {
      customerId = user.stripeCustomerId;
      console.log('[API Checkout] Client Stripe existant:', { customerId });
    } else {
      console.log('[API Checkout] Création d’un nouveau client Stripe:', { email: session?.user?.email || guestEmail || user.email });
      const customer = await stripe.customers.create({
        email: session?.user?.email || guestEmail || user.email,
        name: guestName || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : undefined),
      });
      customerId = customer.id;

      // Mettre à jour l'utilisateur avec le stripeCustomerId
      await prisma.user.update({
        where: { id_user: parseInt(userId) },
        data: { stripeCustomerId: customerId },
      });
      console.log('[API Checkout] Nouveau client Stripe créé:', { customerId });
    }

    // Vérifier que le payment_method est valide
    console.log('[API Checkout] Vérification du payment_method:', { stripe_payment_id: paymentInfo.stripe_payment_id });
    try {
      await stripe.paymentMethods.retrieve(paymentInfo.stripe_payment_id);
      console.log('[API Checkout] PaymentMethod valide:', { stripe_payment_id: paymentInfo.stripe_payment_id });
    } catch (error: any) {
      console.error('[API Checkout] Erreur lors de la récupération du payment_method:', {
        stripe_payment_id: paymentInfo.stripe_payment_id,
        error: error.message,
      });
      return NextResponse.json(
        { error: 'Le payment_method est invalide ou non accessible', details: error.message },
        { status: 400 }
      );
    }

    // Associer le payment_method au client si nécessaire
    console.log('[API Checkout] Tentative d’attachement du payment_method:', { stripe_payment_id: paymentInfo.stripe_payment_id, customerId });
    try {
      await stripe.paymentMethods.attach(paymentInfo.stripe_payment_id, {
        customer: customerId,
      });
      console.log('[API Checkout] PaymentMethod attaché au client:', {
        paymentMethod: paymentInfo.stripe_payment_id,
        customerId,
      });
    } catch (error: any) {
      if (error.code !== 'resource_already_exists') {
        console.error('[API Checkout] Erreur lors de l’attachement du payment_method:', {
          error: error.message,
        });
        return NextResponse.json(
          { error: 'Erreur lors de l’association du moyen de paiement au client', details: error.message },
          { status: 400 }
        );
      }
      console.log('[API Checkout] PaymentMethod déjà attaché:', {
        paymentMethod: paymentInfo.stripe_payment_id,
        customerId,
      });
    }

    // Créer le PaymentIntent sans confirmation immédiate
    console.log('[API Checkout] Création du PaymentIntent:', {
      amount: Math.round(totalAmount * 100),
      customerId,
      paymentMethod: paymentInfo.stripe_payment_id,
    });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Montant en centimes
      currency: 'eur',
      customer: customerId,
      payment_method: paymentInfo.stripe_payment_id,
      // Supprimé : off_session: true, confirm: true
      metadata: {
        addressId,
        paymentId,
        userId,
      },
      description: `Commande pour utilisateur ${userId}`,
    });

    console.log('[API Checkout] PaymentIntent créé:', {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement initialisé avec succès',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('[API Checkout] Erreur:', {
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
    });
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement du paiement', details: error.message },
      { status: 500 }
    );
  }
}