'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Order {
  id_order: number;
  invoice_number: string;
  total_amount: number;
  order_status: string;
  payment_method: string;
  last_card_digits: string | null;
  address: {
    first_name: string;
    last_name: string;
    address1: string;
    address2: string | null;
    city: string;
    postal_code: string;
    country: string;
  };
  user: {
    email: string;
  };
  order_items: {
    id_product: number;
    quantity: number;
    unit_price: number;
    subscription_type: string;
  }[];
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError('Aucun ID de commande fourni');
        setLoading(false);
        return;
      }

      console.log(`[fetchOrder] Chargement de la commande ID: ${orderId}`);

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        console.log('[fetchOrder] Statut de la réponse:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[fetchOrder] Erreur de réponse:', errorData);
          setError(`Erreur lors du chargement de la commande: ${errorData.message || 'Erreur inconnue'}`);
          setLoading(false);
          return;
        }

        const orderData = await response.json();
        console.log('[fetchOrder] Commande chargée:', orderData);
        setOrder(orderData);
        setLoading(false);
      } catch (err) {
        console.error('[SuccessPage] Erreur réseau:', err);
        setError('Erreur réseau lors du chargement de la commande');
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handleDownloadInvoice = async () => {
    if (!order) {
      console.warn('[handleDownloadInvoice] Aucun ordre disponible');
      return;
    }

    console.log(`[handleDownloadInvoice] Tentative de téléchargement de /api/invoices/${order.id_order}/download`);

    try {
      const response = await fetch(`/api/invoices/${order.id_order}/download`);
      console.log('[handleDownloadInvoice] Statut de la réponse:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[handleDownloadInvoice] Réponse non OK:', errorText);
        throw new Error('Erreur lors du téléchargement de la facture');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${order.invoice_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      console.log('[handleDownloadInvoice] Téléchargement réussi');
    } catch (err) {
      console.error('[SuccessPage] Erreur téléchargement facture:', err);
      setError('Erreur lors du téléchargement de la facture');
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Erreur</h1>
        <p className="text-red-500">{error || 'Commande non trouvée'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Paiement réussi</h1>
      <p className="mb-4">Merci pour votre commande ! Voici les détails de votre commande.</p>
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif de la commande #{order.id_order}</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-semibold">Facture #{order.invoice_number}</h2>
          <p>Statut : {order.order_status}</p>
          <h2 className="text-lg font-semibold mt-4">Articles</h2>
          {order.order_items.map((item, index) => (
            <div key={index} className="mb-2">
              <p>Produit ID: {item.id_product}</p>
              <p>Quantité : {item.quantity}</p>
              <p>Abonnement : {item.subscription_type}</p>
              <p>
                Total : {(item.unit_price * item.quantity).toFixed(2)} €
              </p>
            </div>
          ))}
          <p className="text-xl font-bold mt-4">
            Total payé : {order.total_amount.toFixed(2)} €
          </p>

          <h2 className="text-lg font-semibold mt-4">Adresse de facturation</h2>
          <p>
            {order.address.first_name} {order.address.last_name}
          </p>
          <p>{order.address.address1}</p>
          {order.address.address2 && <p>{order.address.address2}</p>}
          <p>
            {order.address.city}, {order.address.postal_code}, {order.address.country}
          </p>

          <h2 className="text-lg font-semibold mt-4">Moyen de paiement</h2>
          <p>
            {order.payment_method} {order.last_card_digits ? `**** ${order.last_card_digits}` : ''}
          </p>

          <h2 className="text-lg font-semibold mt-4">E-mail</h2>
          <p>{order.user.email}</p>
        </CardContent>
      </Card>

      <Button className="mt-4" onClick={handleDownloadInvoice}>
        Télécharger la facture
      </Button>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
