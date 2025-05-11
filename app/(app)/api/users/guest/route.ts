import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { encode } from 'next-auth/jwt';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    console.log('[GuestRoute] Création utilisateur invité:', { email });

    if (!email || typeof email !== 'string') {
      console.error('[GuestRoute] E-mail manquant ou invalide');
      return NextResponse.json({ error: 'E-mail requis' }, { status: 400 });
    }

    // Vérifier si l'e-mail existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('[GuestRoute] E-mail déjà utilisé:', { email });
      return NextResponse.json({ error: 'Cet e-mail est déjà associé à un compte' }, { status: 400 });
    }

    // Créer un client Stripe
    const stripeCustomer = await stripe.customers.create({
      email,
      description: `Guest user ${email}`,
    });
    console.log('[GuestRoute] Client Stripe créé:', { stripeCustomerId: stripeCustomer.id });

    // Créer un utilisateur invité
    const guestUser = await prisma.user.create({
      data: {
        email,
        isGuest: true,
        active: true,
        role: 'CUSTOMER',
        stripeCustomerId: stripeCustomer.id,
        first_name: '', // Valeur par défaut
        last_name: '', // Valeur par défaut
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Créer un token de session NextAuth pour l'utilisateur invité
    const token = {
      id_user: guestUser.id_user,
      email: guestUser.email,
      first_name: guestUser.first_name || '',
      last_name: guestUser.last_name || '',
      role: guestUser.role,
      isGuest: guestUser.isGuest,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (2 * 60 * 60), // 2 heures
    };

    const encodedToken = await encode({
      token,
      secret: process.env.NEXTAUTH_SECRET!,
    });

    // Définir le cookie next-auth.session-token
    cookies().set('next-auth.session-token', encodedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 2 * 60 * 60, // 2 heures
      path: '/',
      sameSite: 'lax',
    });

    console.log('[GuestRoute] Utilisateur invité créé et session établie:', {
      id_user: guestUser.id_user,
      email,
      stripeCustomerId: stripeCustomer.id,
    });

    return NextResponse.json(guestUser, { status: 201 });
  } catch (error: any) {
    console.error('[GuestRoute] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erreur lors de la création de l’utilisateur invité', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}