import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json(
      { error: 'Utilisateur non identifié' },
      { status: 401 }
    );
  }

  try {
    const paymentInfos = await prisma.paymentInfo.findMany({
      where: { id_user: parseInt(userId) },
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

    return NextResponse.json(paymentInfos);
  } catch (error: any) {
    console.error('[API Payment Infos] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des moyens de paiement', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json(
      { error: 'Utilisateur non identifié' },
      { status: 401 }
    );
  }

  try {
    const {
      userId: bodyUserId,
      card_name,
      stripe_payment_id,
      stripe_customer_id,
      last_card_digits,
      brand,
    } = await request.json();

    if (!card_name || !stripe_payment_id || !stripe_customer_id || !last_card_digits || !brand) {
      console.error('[API Payment Infos] Données manquantes:', {
        card_name,
        stripe_payment_id,
        stripe_customer_id,
        last_card_digits,
        brand,
      });
      return NextResponse.json(
        { error: 'Données de paiement incomplètes', missing: { card_name, stripe_payment_id, stripe_customer_id, last_card_digits, brand } },
        { status: 400 }
      );
    }

    const paymentInfo = await prisma.paymentInfo.create({
      data: {
        id_user: parseInt(userId),
        card_name,
        stripe_payment_id,
        stripe_customer_id,
        last_card_digits,
        brand,
        exp_month: null, // Ajuste selon ton modèle
        exp_year: null, // Ajuste selon ton modèle
        is_default: false,
      },
    });

    console.log('[API Payment Infos] Moyen de paiement créé:', {
      id_payment_info: paymentInfo.id_payment_info,
      stripe_payment_id,
      stripe_customer_id,
      last_card_digits,
      brand,
    });

    return NextResponse.json(paymentInfo);
  } catch (error: any) {
    console.error('[API Payment Infos] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l’ajout du moyen de paiement', details: error.message },
      { status: 500 }
    );
  }
}