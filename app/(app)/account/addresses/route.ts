import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "../../api/auth/[...nextauth]/route"

// Récupération des paramètres dynamiques de l'URL
export async function GET(request: Request, { params }: { params: { id_user: string } }) {
  try {
    console.log('[API Addresses] Requête GET reçue avec params:', params);

    const session = await getServerSession(authOptions);

    if (!session?.user?.id_user || session.user.id_user !== parseInt(params.id_user)) {
      return NextResponse.json(
        { message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id_user);
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'ID utilisateur invalide' }, { status: 400 });
    }

    const addresses = await prisma.address.findMany({
      where: { id_user: userId },
    });

    return NextResponse.json(addresses, { status: 200 });
  } catch (error: any) {
    // console.error('[API Addresses] Erreur GET:', error.message);
    return NextResponse.json({ message: 'Erreur serveur', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id_user: string } }) {
  try {
    console.log('[API Addresses] Requête POST reçue avec params:', params);

    const session = await getServerSession(authOptions);

    if (!session?.user?.id_user || session.user.id_user !== parseInt(params.id_user)) {
      return NextResponse.json(
        { message: 'Non autorisé. Veuillez vous connecter.' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id_user);
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'ID utilisateur invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { first_name, last_name, address1, address2, postal_code, city, country, mobile_phone } = body;

    if (!first_name || !last_name || !address1 || !postal_code || !city || !country || !mobile_phone) {
      return NextResponse.json(
        { message: 'Tous les champs obligatoires doivent être remplis.' },
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

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    // console.error('[API Addresses] Erreur POST:', error.message);
    return NextResponse.json(
      { message: 'Erreur lors de la création de l’adresse', error: error.message },
      { status: 500 }
    );
  }
}
