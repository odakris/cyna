import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('[API Sessions] Début de la requête POST');
    const body = await request.json();
    const { email } = body;

    console.log('[API Sessions] Paramètres:', { email });

    if (!email) {
      console.error('[API Sessions] Email manquant');
      return NextResponse.json(
        { error: 'Email requis pour créer une session invité' },
        { status: 400 }
      );
    }

    const session = await prisma.session.create({
      data: {
        email,
      },
    });

    console.log('[API Sessions] Session créée:', session);
    return NextResponse.json(session, { status: 201 });
  } catch (error: any) {
    console.error('[API Sessions] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
    console.log('[API Sessions] Connexion Prisma fermée');
  }
}