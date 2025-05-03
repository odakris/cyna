import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    console.log('[API Addresses] Début de la requête GET');
    console.log('[API Addresses] Headers reçus:', Object.fromEntries(request.headers));

    const session = await getServerSession(authOptions);
    console.log('[API Addresses] Session:', {
      userId: session?.user?.id_user,
      sessionExists: !!session,
    });

    if (!session?.user?.id_user) {
      console.error('[API Addresses] Utilisateur non connecté');
      return NextResponse.json(
        { message: 'Utilisateur non connecté. Veuillez vous connecter pour accéder à vos adresses.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id_user);
    if (isNaN(userId)) {
      console.error('[API Addresses] userId invalide:', { userId: session.user.id_user });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { id_user: userId },
    });

    console.log('[API Addresses] Adresses récupérées:', {
      count: addresses.length,
      addresses,
    });

    if (addresses.length === 0) {
      console.warn('[API Addresses] Aucune adresse trouvée pour l’utilisateur:', { userId });
    }

    return NextResponse.json(addresses, { status: 200 });
  } catch (error: any) {
    console.error('[API Addresses] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des adresses', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('[API Addresses] Début de la requête POST');
    const session = await getServerSession(authOptions);
    console.log('[API Addresses] Session:', {
      userId: session?.user?.id_user,
      sessionExists: !!session,
    });

    if (!session?.user?.id_user) {
      console.error('[API Addresses] Utilisateur non connecté');
      return NextResponse.json(
        { message: 'Utilisateur non connecté. Veuillez vous connecter pour ajouter une adresse.' },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id_user);
    if (isNaN(userId)) {
      console.error('[API Addresses] userId invalide:', { userId: session.user.id_user });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, address1, address2, postal_code, city, country, mobile_phone } = body;

    if (!first_name || !last_name || !address1 || !postal_code || !city || !country || !mobile_phone) {
      console.error('[API Addresses] Champs obligatoires manquants:', body);
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    const newAddress = await prisma.address.create({
      data: {
        id_user: userId,
        first_name,
        last_name,
        address1,
        address2,
        postal_code,
        city,
        country,
        mobile_phone,
      },
    });

    console.log('[API Addresses] Adresse créée:', newAddress);
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    console.error('[API Addresses] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Erreur lors de la création de l’adresse', error: error.message },
      { status: 500 }
    );
  }
}