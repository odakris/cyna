import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    // eslint-disable-next-line no-console
    console.log('[API Addresses] Début de la requête GET');

    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');

    // eslint-disable-next-line no-console
    console.log('[API Addresses] Paramètres reçus:', { addressId, userId: session?.user?.id });

    // Vérifier si l'utilisateur est connecté
    if (!session?.user?.id) {
      // eslint-disable-next-line no-console
      console.error('[API Addresses] Utilisateur non connecté');
      return NextResponse.json(
        { message: 'Utilisateur non connecté. Veuillez vous connecter pour accéder à vos adresses.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);

    // Si addressId est fourni, récupérer une adresse spécifique
    if (addressId) {
      if (isNaN(parseInt(addressId))) {
        // eslint-disable-next-line no-console
        console.error('[API Addresses] addressId invalide:', { addressId });
        return NextResponse.json(
          { message: 'addressId doit être un nombre valide' },
          { status: 400 }
        );
      }

      const address = await prisma.address.findFirst({
        where: {
          id_address: parseInt(addressId),
          id_user: userId,
        },
      });

      if (!address) {
        // eslint-disable-next-line no-console
        console.error('[API Addresses] Adresse non trouvée:', { addressId, userId });
        return NextResponse.json(
          { message: 'Adresse non trouvée ou vous n’avez pas les permissions pour y accéder' },
          { status: 404 }
        );
      }

      // eslint-disable-next-line no-console
      console.log('[API Addresses] Adresse récupérée:', address);
      return NextResponse.json(address, { status: 200 });
    }

    // Sinon, récupérer toutes les adresses de l'utilisateur
    const addresses = await prisma.address.findMany({
      where: { id_user: userId },
    });

    // eslint-disable-next-line no-console
    console.log('[API Addresses] Adresses récupérées:', { count: addresses.length });
    return NextResponse.json(addresses, { status: 200 });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[API Addresses] Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des adresses', error: error.message },
      { status: 500 }
    );
  }
}