import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    console.log('[API Payment Infos] Début de la requête GET');
    console.log('[API Payment Infos] Headers reçus:', Object.fromEntries(request.headers));

    const session = await getServerSession(authOptions);
    const userIdHeader = request.headers.get('x-user-id');

    let userId: number;
    if (session?.user?.id_user) {
      userId = parseInt(session.user.id_user);
      console.log('[API Payment Infos] Utilisateur connecté:', { userId });
    } else if (userIdHeader) {
      userId = parseInt(userIdHeader);
      console.log('[API Payment Infos] Utilisateur invité:', { userId });
    } else {
      console.error('[API Payment Infos] Utilisateur non identifié');
      return NextResponse.json(
        { message: 'Utilisateur non identifié. Veuillez vous connecter ou fournir un ID utilisateur.' },
        { status: 401 }
      );
    }

    if (isNaN(userId)) {
      console.error('[API Payment Infos] userId invalide:', { userId });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id_user: userId } });
    if (!user) {
      console.error('[API Payment Infos] Utilisateur non trouvé:', { userId });
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const paymentInfos = await prisma.paymentInfo.findMany({
      where: { id_user: userId },
    });

    console.log('[API Payment Infos] Récupération réussie:', {
      userId,
      count: paymentInfos.length,
      paymentInfos: paymentInfos.map(p => ({
        id_payment_info: p.id_payment_info,
        stripe_payment_id: p.stripe_payment_id,
        stripe_customer_id: p.stripe_customer_id,
        last_card_digits: p.last_card_digits,
        brand: p.brand,
      })),
    });

    return NextResponse.json(paymentInfos, { status: 200 });
  } catch (error: any) {
    console.error('[API Payment Infos] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des moyens de paiement', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API Payment Infos] Début de la requête POST');
    const session = await getServerSession(authOptions);
    const userIdHeader = request.headers.get('x-user-id');

    let userId: number;
    if (session?.user?.id_user) {
      userId = parseInt(session.user.id_user);
      console.log('[API Payment Infos] Utilisateur connecté:', { userId });
    } else if (userIdHeader) {
      userId = parseInt(userIdHeader);
      console.log('[API Payment Infos] Utilisateur invité:', { userId });
    } else {
      console.error('[API Payment Infos] Utilisateur non identifié');
      return NextResponse.json(
        { message: 'Utilisateur non identifié. Veuillez vous connecter ou fournir un ID utilisateur.' },
        { status: 401 }
      );
    }

    if (isNaN(userId)) {
      console.error('[API Payment Infos] userId invalide:', { userId });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id_user: userId } });
    if (!user) {
      console.error('[API Payment Infos] Utilisateur non trouvé:', { userId });
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const {
      card_name,
      stripe_payment_id,
      stripe_customer_id,
      last_card_digits,
      brand,
      exp_month,
      exp_year,
    } = await request.json();

    if (!card_name || !stripe_payment_id || !stripe_customer_id || !last_card_digits || !brand) {
      console.error('[API Payment Infos] Données manquantes:', {
        card_name,
        stripe_payment_id,
        stripe_customer_id,
        last_card_digits,
        brand,
        exp_month,
        exp_year,
      });
      return NextResponse.json(
        {
          message: 'Données de paiement incomplètes',
          missing: { card_name, stripe_payment_id, stripe_customer_id, last_card_digits, brand },
        },
        { status: 400 }
      );
    }

    // Valider exp_month et exp_year
    const validatedExpMonth = exp_month ? parseInt(exp_month) : null;
    const validatedExpYear = exp_year ? parseInt(exp_year) : null;

    if (exp_month && (isNaN(validatedExpMonth) || validatedExpMonth < 1 || validatedExpMonth > 12)) {
      console.error('[API Payment Infos] exp_month invalide:', { exp_month });
      return NextResponse.json(
        { message: 'Mois d’expiration invalide' },
        { status: 400 }
      );
    }

    if (exp_year && (isNaN(validatedExpYear) || validatedExpYear < new Date().getFullYear())) {
      console.error('[API Payment Infos] exp_year invalide:', { exp_year });
      return NextResponse.json(
        { message: 'Année d’expiration invalide' },
        { status: 400 }
      );
    }

    const paymentInfo = await prisma.paymentInfo.create({
      data: {
        id_user: userId,
        card_name,
        stripe_payment_id,
        stripe_customer_id,
        last_card_digits,
        brand,
        exp_month: validatedExpMonth,
        exp_year: validatedExpYear,
        is_default: false,
      },
    });

    console.log('[API Payment Infos] Moyen de paiement créé:', {
      id_payment_info: paymentInfo.id_payment_info,
      stripe_payment_id,
      stripe_customer_id,
      last_card_digits,
      brand,
      exp_month: validatedExpMonth,
      exp_year: validatedExpYear,
    });

    return NextResponse.json(paymentInfo, { status: 201 });
  } catch (error: any) {
    console.error('[API Payment Infos] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Erreur lors de l’ajout du moyen de paiement', error: error.message },
      { status: 500 }
    );
  }
}
