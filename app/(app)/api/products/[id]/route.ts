import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Extraire l'ID de l'URL
    const id = req.nextUrl.pathname.split('/').pop();
    const id_product = parseInt(id || '');

    if (isNaN(id_product)) {
      return NextResponse.json(
        { message: 'ID du produit invalide' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id_product },
    });

    if (!product) {
      return NextResponse.json(
        { message: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Erreur dans /api/products/[id]:', error);
    return NextResponse.json(
      { message: 'Erreur serveur lors de la récupération du produit' },
      { status: 500 }
    );
  }
}