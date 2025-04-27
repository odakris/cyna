import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    // eslint-disable-next-line no-console
    console.log('[API PaymentInfos] Début de la requête GET');

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    // eslint-disable-next-line no-console
    console.log('[API PaymentInfos] Paramètres reçus:', { paymentId, userId: session?.user?.id });

    // Vérifier si l'utilisateur est connecté
    if (!session?.user?.id) {
      // eslint-disable-next-line no-console
      console.error('[API PaymentInfos] Utilisateur non connecté');
      return NextResponse.json(
        { message: 'Utilisateur non connecté. Veuillez vous connecter pour accéder à vos informations de paiement.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Si paymentId est fourni, récupérer un moyen de paiement spécifique
    if (paymentId) {
      if (isNaN(parseInt(paymentId))) {
        // eslint-disable-next-line no-console
        console.error('[API PaymentInfos] paymentId invalide:', { paymentId });
        return NextResponse.json(
          { message: 'paymentId doit être un nombre valide' },
          { status: 400 }
        );
      }

      const paymentInfo = await prisma.paymentInfo.findFirst({
        where: {
          id_payment_info: parseInt(paymentId),
          id_user: userId,
        },
      });

      if (!paymentInfo) {
        // eslint-disable-next-line no-console
        console.error('[API PaymentInfos] Informations de paiement non trouvées:', { paymentId, userId });
        return NextResponse.json(
          { message: 'Informations de paiement non trouvées ou vous n’avez pas les permissions pour y accéder' },
          { status: 404 }
        );
      }

      // eslint-disable-next-line no-console
      console.log('[API PaymentInfos] Informations de paiement récupérées:', paymentInfo);
      return NextResponse.json(paymentInfo, { status: 200 });
    }

    // Sinon, récupérer tous les moyens de paiement de l'utilisateur
    const paymentInfos = await prisma.paymentInfo.findMany({
      where: { id_user: userId },
    });

    // eslint-disable-next-line no-console
    console.log('[API PaymentInfos] Moyens de paiement récupérés:', { count: paymentInfos.length });
    return NextResponse.json(paymentInfos, { status: 200 });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[API PaymentInfos] Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des informations de paiement', error: error.message },
      { status: 500 }
    );
  }
}