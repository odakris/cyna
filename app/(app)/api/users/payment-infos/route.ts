import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    console.log('[API PaymentInfos] Début de la requête GET');

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    console.log('[API PaymentInfos] Paramètres reçus:', { paymentId, userId: session?.user?.id_user });

    if (!session?.user?.id_user) {
      console.error('[API PaymentInfos] Utilisateur non connecté');
      return new NextResponse(
        JSON.stringify({ message: 'Utilisateur non connecté. Veuillez vous connecter pour accéder à vos informations de paiement.' }),
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const userId = session.user.id_user;

    if (paymentId) {
      const parsedPaymentId = parseInt(paymentId);
      if (isNaN(parsedPaymentId)) {
        console.error('[API PaymentInfos] paymentId invalide:', { paymentId });
        return new NextResponse(
          JSON.stringify({ message: 'paymentId doit être un nombre valide' }),
          {
            status: 400,
            headers: { 'Cache-Control': 'no-store' },
          }
        );
      }

      const paymentInfo = await prisma.paymentInfo.findFirst({
        where: {
          id_payment_info: parsedPaymentId,
          id_user: userId,
        },
      });

      if (!paymentInfo) {
        console.error('[API PaymentInfos] Informations de paiement non trouvées:', { paymentId, userId });
        return new NextResponse(
          JSON.stringify({ message: 'Informations de paiement non trouvées ou vous n’avez pas les permissions pour y accéder' }),
          {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
          }
        );
      }

      console.log('[API PaymentInfos] Informations de paiement récupérées:', paymentInfo);
      return new NextResponse(JSON.stringify(paymentInfo), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const paymentInfos = await prisma.paymentInfo.findMany({
      where: { id_user: userId },
    });

    console.log('[API PaymentInfos] Moyens de paiement récupérés:', { count: paymentInfos.length });
    return new NextResponse(JSON.stringify(paymentInfos), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    console.error('[API PaymentInfos] Erreur:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Erreur lors de la récupération des informations de paiement', error: error.message }),
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API PaymentInfos] Début de la requête POST');

    const session = await getServerSession(authOptions);
    if (!session?.user?.id_user) {
      console.error('[API PaymentInfos] Utilisateur non connecté');
      return new NextResponse(
        JSON.stringify({ message: 'Utilisateur non connecté. Veuillez vous connecter pour ajouter un moyen de paiement.' }),
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const userId = session.user.id_user;
    const data = await request.json();
    console.log('[API PaymentInfos] Données reçues:', data);

    const newPayment = await prisma.paymentInfo.create({
      data: {
        id_user: userId,
        card_name: data.card_name,
        last_card_digits: data.last_card_digits,
        stripe_payment_id: data.stripe_payment_id,
        brand: data.brand,
        exp_month: data.exp_month,
        exp_year: data.exp_year,
        is_default: data.is_default || false,
      },
    });

    console.log('[API PaymentInfos] Moyen de paiement créé:', newPayment);
    return new NextResponse(JSON.stringify(newPayment), {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    console.error('[API PaymentInfos] Erreur:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Erreur lors de la création du moyen de paiement', error: error.message }),
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
