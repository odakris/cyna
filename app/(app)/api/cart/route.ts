import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('[API Cart] Début de la requête GET:', request.url);

  try {
    const url = new URL(request.url);
    const guestId = url.searchParams.get('guestId');
    const userId = request.headers.get('x-user-id');

    console.log('[API Cart] Paramètres:', { guestId, userId });

    if (!guestId && !userId) {
      // console.error('[API Cart] Ni guestId ni userId fourni');
      return NextResponse.json(
        { error: 'Identifiant utilisateur ou invité requis' },
        { status: 400 }
      );
    }

    console.log('[API Cart] Connexion Prisma établie');
    let cartItems;

    if (userId) {
      // Récupérer le panier pour un utilisateur connecté
      cartItems = await prisma.cartItem.findMany({
        where: {
          userId_user: parseInt(userId),
        },
        include: {
          product: true,
        },
      });
    } else if (guestId) {
      // Récupérer le panier pour un invité
      cartItems = await prisma.cartItem.findMany({
        where: {
          sessionId_session: parseInt(guestId),
        },
        include: {
          product: true,
        },
      });
    }

    console.log('[API Cart] Éléments du panier:', cartItems);

    return NextResponse.json(cartItems);
  } catch (error: any) {
    /*console.error('[API Cart] Erreur:', {
      message: error.message,
      stack: error.stack,
    });*/
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('[API Cart] Connexion Prisma fermée');
  }
}