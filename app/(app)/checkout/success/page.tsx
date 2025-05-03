'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderDetails {
  id_order: string;
  total_amount: number;
  order_date: string;
  invoice_number: string;
  payment_method: string;
  last_card_digits: string;
  address: {
    address1: string;
    address2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  order_items: {
    name: string;
    quantity: number;
    price: number;
    subscription_type?: string;
  }[];
}

export default function CheckoutSuccess() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmOrder = async () => {
      const sessionId = searchParams.get('session_id');
      const addressId = searchParams.get('addressId');
      const paymentId = searchParams.get('paymentId');
      const guestId = localStorage.getItem('guestSessionId');

      console.log('[CheckoutSuccess] Confirmation de la commande:', {
        sessionId,
        addressId,
        paymentId,
        guestId,
        userId: session?.user?.id_user,
      });

      if (!sessionId || !addressId || !paymentId) {
        console.error('[CheckoutSuccess] Paramètres manquants:', { sessionId, addressId, paymentId });
        setError('Paramètres de confirmation manquants');
        setLoading(false);
        return;
      }

      try {
        const confirmationUrl = new URL('/api/checkout/confirmation', window.location.origin);
        confirmationUrl.searchParams.append('session_id', sessionId);
        confirmationUrl.searchParams.append('addressId', addressId);
        confirmationUrl.searchParams.append('paymentId', paymentId);
        if (guestId && !session?.user?.id_user) {
          confirmationUrl.searchParams.append('guestId', guestId);
        }

        const response = await fetch(confirmationUrl.toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.user?.id_user && { 'x-user-id': session.user.id_user.toString() }),
          },
        });

        if (response.ok) {
          const orderData = await response.json();
          console.log('[CheckoutSuccess] Commande confirmée:', orderData);
          setOrderDetails(orderData);
          localStorage.removeItem('guestSessionId');
          localStorage.removeItem('guestEmail');
          localStorage.removeItem('guestCheckout');
          localStorage.removeItem('guestAddresses');
          localStorage.removeItem('guestPaymentInfos');
        } else {
          const errorData = await response.json();
          console.error('[CheckoutSuccess] Erreur confirmation:', errorData);
          setError(`Erreur lors de la confirmation de la commande: ${errorData.error || 'Erreur inconnue'}`);
        }
      } catch (err) {
        console.error('[CheckoutSuccess] Erreur réseau:', err);
        setError('Erreur réseau lors de la confirmation de la commande');
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [searchParams, session]);

  const handleDownloadInvoice = async () => {
    if (!orderDetails?.invoice_number) {
      setError('Numéro de facture manquant');
      return;
    }

    try {
      const response = await fetch(`/api/checkout/success?invoice_number=${orderDetails.invoice_number}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du téléchargement de la facture');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture_${orderDetails.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[CheckoutSuccess] Erreur téléchargement facture:', err);
      setError('Erreur lors du téléchargement de la facture');
    }
  };

  if (loading) {
    return <p>Confirmation en cours...</p>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Erreur de confirmation</h1>
        <p className="text-red-500">{error}</p>
        <Button className="mt-4" onClick={() => router.push('/checkout')}>
          Retour au checkout
        </Button>
      </div>
    );
  }

  if (!orderDetails) {
    return <p>Aucune information de commande disponible.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Commande confirmée</h1>
      <Card>
        <CardHeader>
          <CardTitle>Résumé de la commande #{orderDetails.invoice_number}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Date :</strong> {new Date(orderDetails.order_date).toLocaleDateString()}</p>
          <p><strong>Total :</strong> {orderDetails.total_amount.toFixed(2)} €</p>
          <p><strong>Moyen de paiement :</strong> {orderDetails.payment_method} (**** {orderDetails.last_card_digits})</p>
          <p><strong>Adresse :</strong></p>
          <p>{orderDetails.address.address1}</p>
          {orderDetails.address.address2 && <p>{orderDetails.address.address2}</p>}
          <p>{orderDetails.address.city}, {orderDetails.address.postal_code}, {orderDetails.address.country}</p>
          <h3 className="text-lg font-semibold mt-4">Articles</h3>
          {orderDetails.order_items.map((item, index) => (
            <div key={index} className="mb-2">
              <p>{item.name}</p>
              <p>Quantité : {item.quantity}</p>
              <p>Abonnement : {item.subscription_type || 'Aucun'}</p>
              <p>Total : {(item.price * (item.subscription_type === 'YEARLY' ? 12 : 1) * item.quantity).toFixed(2)} €</p>
            </div>
          ))}
          <Button className="mt-4" onClick={handleDownloadInvoice}>
            Télécharger la facture
          </Button>
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={() => router.push('/orders')}>
        Voir mes commandes
      </Button>
    </div>
  );
}