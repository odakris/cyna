import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    console.log('[API PaymentInfos] Début de la requête GET');
    console.log('[API PaymentInfos] Headers reçus:', Object.fromEntries(request.headers));

    const session = await getServerSession(authOptions);
    console.log('[API PaymentInfos] Session:', {
      userId: session?.user?.id_user,
      sessionExists: !!session,
    });

    if (!session?.user?.id_user) {
      console.error('[API PaymentInfos] Utilisateur non connecté');
      return NextResponse.json(
        { message: 'Utilisateur non connecté. Veuillez vous connecter pour accéder à vos informations de paiement.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id_user);
    if (isNaN(userId)) {
      console.error('[API PaymentInfos] userId invalide:', { userId: session.user.id_user });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const paymentInfos = await prisma.paymentInfo.findMany({
      where: { id_user: userId },
    });

    console.log('[API PaymentInfos] Moyens de paiement récupérés:', {
      count: paymentInfos.length,
      paymentInfos,
    });

    if (paymentInfos.length === 0) {
      console.warn('[API PaymentInfos] Aucun moyen de paiement trouvé pour l’utilisateur:', { userId });
    }

    return NextResponse.json(paymentInfos, { status: 200 });
  } catch (error: any) {
    console.error('[API PaymentInfos] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des informations de paiement', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API PaymentInfos] Début de la requête POST');
    const session = await getServerSession(authOptions);
    console.log('[API PaymentInfos] Session:', {
      userId: session?.user?.id_user,
      sessionExists: !!session,
    });

    if (!session?.user?.id_user) {
      console.error('[API PaymentInfos] Utilisateur non connecté');
      return NextResponse.json(
        { message: 'Utilisateur non connecté. Veuillez vous connecter pour ajouter un moyen de paiement.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id_user);
    if (isNaN(userId)) {
      console.error('[API PaymentInfos] userId invalide:', { userId: session.user.id_user });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { card_name, stripe_payment_id, last_card_digits, brand } = body;

    if (!card_name || !stripe_payment_id || !last_card_digits || !brand) {
      console.error('[API PaymentInfos] Champs obligatoires manquants:', body);
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const newPaymentInfo = await prisma.paymentInfo.create({
      data: {
        id_user: userId,
        card_name,
        stripe_payment_id,
        last_card_digits,
        brand,
      },
    });

    console.log('[API PaymentInfos] Moyen de paiement créé:', newPaymentInfo);
    return NextResponse.json(newPaymentInfo, { status: 201 });
  } catch (error: any) {
    console.error('[API PaymentInfos] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Erreur lors de la création du moyen de paiement', error: error.message },
      { status: 500 }
    );
  }
}