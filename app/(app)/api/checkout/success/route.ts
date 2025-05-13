import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Récupérer la session de l'utilisateur
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id_user;
    if (!userId) {
      // console.error('[API Checkout Success] Utilisateur non authentifié');
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const invoiceNumber = request.nextUrl.searchParams.get('invoice_number');
    console.log('[API Checkout Success] Requête de facture:', { invoiceNumber });

    if (!invoiceNumber) {
      // console.error('[API Checkout Success] Numéro de facture manquant');
      return NextResponse.json({ error: 'Numéro de facture requis' }, { status: 400 });
    }

    // Vérifier que la commande existe et appartient à l'utilisateur
    const order = await prisma.order.findUnique({
      where: { invoice_number: invoiceNumber },
      select: { id_user: true, invoice_pdf_url: true },
    });

    if (!order || !order.invoice_pdf_url) {
      // console.error('[API Checkout Success] Facture non trouvée:', { invoiceNumber });
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    if (order.id_user !== userId) {
      // console.error('[API Checkout Success] Accès non autorisé:', { invoiceNumber, userId });
      return NextResponse.json(
        { error: 'Accès non autorisé à cette commande' },
        { status: 403 }
      );
    }

    // Appeler l'URL dynamique pour générer le PDF
    const response = await fetch(`${request.nextUrl.origin}${order.invoice_pdf_url}`, {
      method: 'GET',
      headers: {
        Cookie: request.headers.get('cookie') || '', // Transférer les cookies pour l'authentification
      },
    });

    if (!response.ok) {
      // console.error('[API Checkout Success] Erreur lors de la génération du PDF:', { status: response.status });
      return NextResponse.json(
        { error: 'Erreur lors de la génération de la facture' },
        { status: response.status }
      );
    }

    const pdfBuffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=facture_${invoiceNumber}.pdf`,
      },
    });
  } catch (error: any) {
    /*console.error('[API Checkout Success] Erreur:', {
      message: error.message,
      stack: error.stack,
    });*/
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement de la facture', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}