import { NextRequest } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const orderId = parseInt(params.orderId);
  const order = await prisma.order.findUnique({
    where: { id_order: orderId },
    include: {
      order_items: true,
      address: true,
      user: true,
    },
  });

  if (!order) {
    return new Response(JSON.stringify({ error: 'Commande introuvable' }), {
      status: 404,
    });
  }

  // Génération du PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  page.drawText(`Facture #${order.invoice_number}`, {
    x: 50,
    y: height - 50,
    size: 18,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Client : ${order.user.email}`, {
    x: 50,
    y: height - 80,
    size: fontSize,
    font,
  });

  page.drawText(`Adresse : ${order.address.address1}, ${order.address.city}`, {
    x: 50,
    y: height - 100,
    size: fontSize,
    font,
  });

  let yPosition = height - 140;
  for (const item of order.order_items) {
    page.drawText(
      `Produit #${item.id_product} - ${item.quantity} x ${item.unit_price} €`,
      {
        x: 50,
        y: yPosition,
        size: fontSize,
        font,
      }
    );
    yPosition -= 20;
  }

  page.drawText(`Total payé : ${order.total_amount} €`, {
    x: 50,
    y: yPosition - 20,
    size: fontSize,
    font,
  });

  const pdfBytes = await pdfDoc.save();

  return new Response(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=facture_${order.invoice_number}.pdf`,
    },
  });
}
