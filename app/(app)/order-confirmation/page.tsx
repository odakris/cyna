'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError('Identifiant de commande manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('[OrderConfirmation] Récupération de la commande:', { orderId });

        // Simulation d'une commande
        const simulatedOrder = {
          id_order: orderId,
          total_amount: 549.89,
          created_at: new Date().toISOString(),
          cartItems: [
            {
              id: '1',
              uniqueId: '1-MONTHLY-1745939337469',
              name: 'Diagnostic Cyber',
              price: 49.99,
              quantity: 1,
              subscription: 'MONTHLY',
            },
            {
              id: '1',
              uniqueId: '1-YEARLY-1745939339369',
              name: 'Diagnostic Cyber',
              price: 499.9,
              quantity: 1,
              subscription: 'YEARLY',
            },
          ],
        };

        setOrder(simulatedOrder);
        console.log('[OrderConfirmation] Commande récupérée:', simulatedOrder);
      } catch (err) {
        console.error('[OrderConfirmation] Erreur lors de la récupération:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (!order) return;

    const generatePDF = async () => {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const margin = 50;
      let y = height - margin;

      page.drawText(`Facture - Commande #${order.id_order}`, {
        x: margin,
        y,
        size: 18,
        font,
        color: rgb(0, 0, 0),
      });

      y -= 30;
      page.drawText(`Date : ${new Date(order.created_at).toLocaleDateString()}`, { x: margin, y, size: 12, font });
      y -= 20;
      page.drawText(`Total : ${order.total_amount.toFixed(2)} €`, { x: margin, y, size: 12, font });

      y -= 40;
      page.drawText(`Articles :`, { x: margin, y, size: 14, font });

      for (const item of order.cartItems) {
        y -= 20;
        page.drawText(`- ${item.name} (${item.subscription}) x${item.quantity} - ${(item.price * item.quantity).toFixed(2)} €`, {
          x: margin,
          y,
          size: 12,
          font,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setInvoiceUrl(url);
    };

    generatePDF();
  }, [order]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">Erreur : {error}</p>;
  if (!order) return <p>Aucune commande trouvée.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Confirmation de commande</h1>
      <Card>
        <CardHeader>
          <CardTitle>Commande #{order.id_order}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Date : {new Date(order.created_at).toLocaleDateString()}</p>
          <p>Total : {order.total_amount.toFixed(2)} €</p>
          <h3 className="mt-4 font-semibold">Articles :</h3>
          {order.cartItems.map((item: any) => (
            <div key={item.uniqueId} className="mb-2">
              <p>{item.name}</p>
              <p>Quantité : {item.quantity}</p>
              <p>Abonnement : {item.subscription}</p>
              <p>Prix : {(item.price * item.quantity).toFixed(2)} €</p>
            </div>
          ))}

          {invoiceUrl && (
            <a
              href={invoiceUrl}
              download={`facture-${order.id_order}.pdf`}
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Télécharger la facture (PDF)
            </a>
          )}

          <Button asChild className="mt-4 ml-4">
            <Link href="/">Retour à l’accueil</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
