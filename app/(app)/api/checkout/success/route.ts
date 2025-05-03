import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const invoiceNumber = request.nextUrl.searchParams.get('invoice_number');
    console.log('[API Checkout Success] Requête de facture:', { invoiceNumber });

    if (!invoiceNumber) {
      console.error('[API Checkout Success] Numéro de facture manquant');
      return NextResponse.json({ error: 'Numéro de facture requis' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { invoice_number: invoiceNumber },
      select: { invoice_pdf_url: true },
    });

    if (!order || !order.invoice_pdf_url) {
      console.error('[API Checkout Success] Facture non trouvée:', { invoiceNumber });
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), 'public', order.invoice_pdf_url);
    const fileBuffer = await fs.readFile(filePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=facture_${invoiceNumber}.pdf`,
      },
    });
  } catch (error: any) {
    console.error('[API Checkout Success] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement de la facture', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}