import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  try {
    console.log('[API Addresses] Début de la requête GET');
    console.log('[API Addresses] Headers reçus:', Object.fromEntries(request.headers));

    const session = await getServerSession(authOptions);
    const userIdHeader = request.headers.get('x-user-id');

    let userId: number;
    if (session?.user?.id_user) {
      userId = parseInt(session.user.id_user);
      console.log('[API Addresses] Utilisateur connecté:', { userId });
    } else if (userIdHeader) {
      userId = parseInt(userIdHeader);
      console.log('[API Addresses] Utilisateur invité:', { userId });
    } else {
      console.error('[API Addresses] Utilisateur non identifié');
      return NextResponse.json(
        { message: 'Utilisateur non identifié. Veuillez vous connecter ou fournir un ID utilisateur.' },
        { status: 401 }
      );
    }

    if (isNaN(userId)) {
      console.error('[API Addresses] userId invalide:', { userId });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id_user: userId } });
    if (!user) {
      console.error('[API Addresses] Utilisateur non trouvé:', { userId });
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { id_user: userId },
    });

    console.log('[API Addresses] Adresses récupérées:', {
      count: addresses.length,
      addresses: addresses.map(a => ({
        id_address: a.id_address,
        address1: a.address1,
        city: a.city,
      })),
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
    const userIdHeader = request.headers.get('x-user-id');

    let userId: number;
    if (session?.user?.id_user) {
      userId = parseInt(session.user.id_user);
      console.log('[API Addresses] Utilisateur connecté:', { userId });
    } else if (userIdHeader) {
      userId = parseInt(userIdHeader);
      console.log('[API Addresses] Utilisateur invité:', { userId });
    } else {
      console.error('[API Addresses] Utilisateur non identifié');
      return NextResponse.json(
        { message: 'Utilisateur non identifié. Veuillez vous connecter ou fournir un ID utilisateur.' },
        { status: 401 }
      );
    }

    if (isNaN(userId)) {
      console.error('[API Addresses] userId invalide:', { userId });
      return NextResponse.json(
        { message: 'ID utilisateur invalide' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { id_user: userId } });
    if (!user) {
      console.error('[API Addresses] Utilisateur non trouvé:', { userId });
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, address1, address2, postal_code, region, city, country, mobile_phone } = body;

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
        address2: address2 || null,
        postal_code,
        region: region || "",
        city,
        country,
        mobile_phone,
      },
    });

    console.log('[API Addresses] Adresse créée:', {
      id_address: newAddress.id_address,
      address1: newAddress.address1,
      city: newAddress.city,
    });

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