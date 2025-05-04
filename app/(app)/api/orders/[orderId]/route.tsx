import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const orderIdParam = url.pathname.split('/').pop(); // Récupère l'ID depuis l'URL
    const orderId = parseInt(orderIdParam || '', 10);

    if (isNaN(orderId)) {
      console.error('[OrderRoute] ID de commande invalide:', orderIdParam);
      return NextResponse.json({ error: 'ID de commande invalide' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id_order: orderId },
      select: {
        id_order: true,
        invoice_pdf_url: true, // ← ce champ manquait
        invoice_number: true,
        total_amount: true,
        payment_method: true,
        last_card_digits: true,
        order_status: true,
        address: true,
        user: {
          select: { email: true },
        },
        order_items: true,
      },
    });
    
    if (!order) {
      console.error('[OrderRoute] Commande non trouvée:', { orderId });
      return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });
    }

    console.log('[OrderRoute] Commande récupérée:', { orderId, total_amount: order.total_amount });
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error('[OrderRoute] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la commande', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
