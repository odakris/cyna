import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: Request) {
  console.log('[API Addresses] Début de la requête GET');
  try {
    const session = await getServerSession(authOptions);
    console.log('[API Addresses] Session récupérée:', {
      userId: session?.user?.id_user || null,
    });

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');
    console.log('[API Addresses] Paramètres reçus:', { addressId });

    if (!session?.user?.id_user) {
      console.error('[API Addresses] Utilisateur non connecté');
      return new NextResponse(
        JSON.stringify({ message: 'Utilisateur non connecté. Veuillez vous connecter pour accéder à vos adresses.' }),
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const userId = session.user.id_user;

    if (addressId) {
      const parsedAddressId = parseInt(addressId);
      if (isNaN(parsedAddressId)) {
        console.error('[API Addresses] addressId invalide:', { addressId });
        return new NextResponse(
          JSON.stringify({ message: 'addressId doit être un nombre valide' }),
          {
            status: 400,
            headers: { 'Cache-Control': 'no-store' },
          }
        );
      }

      const address = await prisma.address.findFirst({
        where: {
          id_address: parsedAddressId,
          id_user: userId,
        },
      });

      if (!address) {
        console.error('[API Addresses] Adresse non trouvée:', { parsedAddressId, userId });
        return new NextResponse(
          JSON.stringify({ message: 'Adresse non trouvée ou vous n’avez pas les permissions pour y accéder' }),
          {
            status: 404,
            headers: { 'Cache-Control': 'no-store' },
          }
        );
      }

      return new NextResponse(JSON.stringify(address), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    const addresses = await prisma.address.findMany({
      where: { id_user: userId },
    });

    return new NextResponse(JSON.stringify(addresses), {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    console.error('[API Addresses] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return new NextResponse(
      JSON.stringify({ message: 'Erreur lors de la récupération des adresses', error: error.message }),
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}

export async function POST(request: Request) {
  console.log('[API Addresses] Début de la requête POST');
  try {
    const session = await getServerSession(authOptions);
    console.log('[API Addresses] Session récupérée:', {
      userId: session?.user?.id_user || null,
    });

    if (!session?.user?.id_user) {
      console.error('[API Addresses] Utilisateur non connecté');
      return new NextResponse(
        JSON.stringify({ message: 'Utilisateur non connecté. Veuillez vous connecter pour ajouter une adresse.' }),
        {
          status: 401,
          headers: { 'Cache-Control': 'no-store' },
        }
      );
    }

    const userId = session.user.id_user;
    const data = await request.json();
    console.log('[API Addresses] Données reçues:', data);

    const newAddress = await prisma.address.create({
      data: {
        id_user: userId,
        first_name: data.first_name,
        last_name: data.last_name,
        address1: data.address1,
        address2: data.address2 || '',
        postal_code: data.postal_code,
        city: data.city,
        region: data.region || '',
        country: data.country,
        mobile_phone: data.mobile_phone,
        is_default_billing: data.is_default_billing || false,
        is_default_shipping: data.is_default_shipping || false,
      },
    });

    return new NextResponse(JSON.stringify(newAddress), {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error: any) {
    console.error('[API Addresses] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return new NextResponse(
      JSON.stringify({ message: 'Erreur lors de la création de l’adresse', error: error.message }),
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      }
    );
  }
}
