'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PDFDocument, rgb } from 'pdf-lib';
import { useCart } from '@/context/CartContext';

// Initialisation de stripePromise
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface CartItem {
  id: string;
  uniqueId: string;
  name: string;
  price: number;
  quantity: number;
  subscription?: string;
  imageUrl?: string;
}

interface Address {
  id_address: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  postal_code: string;
  city: string;
  country: string;
  mobile_phone: string;
}

interface PaymentInfo {
  id_payment_info: string;
  card_name: string;
  last_card_digits: string;
  stripe_payment_id?: string;
}

function ConfirmationContent() {
  const { data: session, status } = useSession();
  const { cart, setCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addressId = searchParams.get('addressId');
  const paymentId = searchParams.get('paymentId');

  console.log('[Confirmation] searchParams:', { addressId, paymentId });

  const totalCartPrice = cart.reduce((sum, item) => {
    let unitPrice = item.price;
    switch (item.subscription || 'MONTHLY') {
      case 'MONTHLY':
        unitPrice = item.price;
        break;
      case 'YEARLY':
        unitPrice = item.price * 12;
        break;
      case 'PER_USER':
        unitPrice = item.price;
        break;
      case 'PER_MACHINE':
        unitPrice = item.price;
        break;
      default:
        unitPrice = item.price;
    }
    return sum + unitPrice * item.quantity;
  }, 0);
  const taxes = totalCartPrice * 0.2;
  const finalTotal = totalCartPrice + taxes;

  const fetchData = async () => {
    console.log('[Confirmation] Début de fetchData', { addressId, paymentId, session: !!session, cartLength: cart.length });
    try {
      if (!addressId || !paymentId) {
        throw new Error('addressId ou paymentId manquant dans les paramètres URL');
      }

      // Mode invité
      if (!session) {
        console.log('[Confirmation] Mode invité, vérification de localStorage');
        const guestAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
        const guestPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');

        console.log('[Confirmation] guestAddresses:', guestAddresses);
        console.log('[Confirmation] guestPaymentInfos:', guestPayments);

        // Décryptage des données invité
        const decryptResponse = await fetch('/api/guest/decrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ addresses: guestAddresses, payments: guestPayments }),
        });

        if (!decryptResponse.ok) {
          const errorText = await decryptResponse.text();
          throw new Error(`Échec du déchiffrement des données invité: ${errorText}`);
        }

        const { addresses: decryptedAddresses, payments: decryptedPayments } = await decryptResponse.json();
        console.log('[Confirmation] Données déchiffrées:', { decryptedAddresses, decryptedPayments });

        const addressData = decryptedAddresses.find((addr: Address) => addr.id_address === addressId);
        const paymentData = decryptedPayments.find((pay: PaymentInfo) => pay.id_payment_info === paymentId);

        console.log('[Confirmation] Données invité trouvées:', { addressData, paymentData });

        if (!addressData) {
          throw new Error('Adresse introuvable dans les données déchiffrées');
        }
        if (!paymentData) {
          throw new Error(`Moyen de paiement introuvable pour paymentId: ${paymentId}`);
        }

        // Vérifier les champs critiques
        if (addressData.first_name.includes(':')) {
          console.warn('[Confirmation] first_name non déchiffré:', addressData.first_name);
        }
        if (paymentData.card_name.includes(':')) {
          console.warn('[Confirmation] card_name non déchiffré:', paymentData.card_name);
        }

        setAddress(addressData);
        setPaymentInfo(paymentData);
        return;
      }

      // Mode connecté
      if (!session.user?.id_user) {
        throw new Error('ID utilisateur manquant dans la session');
      }

      const headers = { 'x-user-id': session.user.id_user.toString(), 'Content-Type': 'application/json' };
      console.log('[Confirmation] Envoi des requêtes API', {
        addressUrl: `/api/users/${session.user.id_user}/addresses/${addressId}`,
        paymentUrl: `/api/users/${session.user.id_user}/payments/${paymentId}`,
        headers,
      });

      const [addressResponse, paymentResponse] = await Promise.all([
        fetch(`/api/users/${session.user.id_user}/addresses/${addressId}`, { headers, credentials: 'include' }),
        fetch(`/api/users/${session.user.id_user}/payments/${paymentId}`, { headers, credentials: 'include' }),
      ]);

      console.log('[Confirmation] Réponses API', {
        addressStatus: addressResponse.status,
        paymentStatus: paymentResponse.status,
      });

      if (!addressResponse.ok) {
        const errorText = await addressResponse.text();
        throw new Error(`Erreur lors du chargement de l’adresse: ${errorText}`);
      }
      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text();
        throw new Error(`Erreur lors du chargement du moyen de paiement: ${errorText}`);
      }

      const addressData = await addressResponse.json();
      const paymentData = await paymentResponse.json();
      console.log('[Confirmation] Données récupérées', { addressData, paymentData });

      if (addressData.first_name.includes(':')) {
        console.warn('[Confirmation] first_name non déchiffré:', addressData.first_name);
      }
      if (paymentData.card_name.includes(':')) {
        console.warn('[Confirmation] card_name non déchiffré:', paymentData.card_name);
      }

      setAddress(addressData);
      setPaymentInfo(paymentData);
    } catch (err) {
      /*console.error('[Confirmation] Erreur dans fetchData', {
        message: err.message,
        stack: err.stack,
      });*/
      setError(err instanceof Error ? err.message : 'Échec du chargement des données. Veuillez réessayer.');
    } finally {
      setLoading(false);
      console.log('[Confirmation] Fin de fetchData', { loading: false, address: !!address, paymentInfo: !!paymentInfo, cartLength: cart.length });
    }
  };

  const handleConfirmPurchase = async () => {
    if (isProcessing) {
      console.log('[Confirmation] handleConfirmPurchase déjà en cours, ignoré');
      return;
    }

    console.log('[Confirmation] Début de handleConfirmPurchase', { totalCartPrice, taxes, addressId, paymentId });
    setIsProcessing(true);

    try {
      if (!paymentId || typeof paymentId !== 'string' || paymentId.trim() === '') {
        // console.error('[Confirmation] paymentId invalide:', paymentId);
        throw new Error('L’identifiant de paiement est requis et doit être une chaîne non vide');
      }

      if (session && isNaN(parseInt(paymentId))) {
        // console.error('[Confirmation] paymentId non numérique pour utilisateur connecté:', paymentId);
        throw new Error('L’identifiant de paiement doit être numérique pour les utilisateurs connectés');
      }

      const guestUserId = localStorage.getItem('guestUserId');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.user?.id_user) {
        headers['x-user-id'] = session.user.id_user.toString();
        console.log('[Confirmation] Envoi de x-user-id:', session.user.id_user);
      } else if (guestUserId) {
        headers['x-guest-id'] = guestUserId;
        console.log('[Confirmation] Envoi de x-guest-id:', guestUserId);
      } else {
        throw new Error('Aucun ID utilisateur ou invité disponible');
      }

      // Standardiser les cartItems pour inclure subscription_type
      const validSubscriptions = ['MONTHLY', 'YEARLY', 'PER_USER', 'PER_MACHINE'];
      const formattedCartItems = cart.map(item => ({
        ...item,
        subscription_type: validSubscriptions.includes(item.subscription || 'MONTHLY')
          ? item.subscription || 'MONTHLY'
          : 'MONTHLY',
      }));

      console.log('[Confirmation] Envoi à /api/checkout', {
        cartItems: formattedCartItems,
        addressId,
        paymentId,
        totalAmount: totalCartPrice,
        taxes,
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          cartItems: formattedCartItems,
          addressId,
          paymentId,
          totalAmount: totalCartPrice,
          taxes,
        }),
      });

      console.log('[Confirmation] /api/checkout response:', {
        status: response.status,
        statusText: response.statusText,
      });

      if (!response.ok) {
        let errorMessage = `Erreur serveur: ${response.statusText}`;
        try {
          const errorData = await response.json();
          // console.error('[Confirmation] Détails de l’erreur serveur:', errorData);
          errorMessage = errorData.message || errorData.error || response.statusText;
        } catch (jsonError) {
          // console.error('[Confirmation] Impossible de parser la réponse:', jsonError);
          if (response.status === 405) {
            errorMessage = 'Méthode non autorisée. Veuillez réessayer ou contacter le support.';
          }
        }
        throw new Error(`Échec de l’initialisation du paiement: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('[Confirmation] Données reçues de /api/checkout:', data);

      if (!data.orderId || !data.status) {
        // console.error('[Confirmation] orderId ou status manquant dans la réponse:', data);
        throw new Error('Réponse du serveur invalide');
      }

      console.log('[Confirmation] orderId défini:', data.orderId);

      if (data.status === 'succeeded') {
        console.log('[Confirmation] Paiement réussi, finalisation:', { orderId: data.orderId });
        await finalizeOrder(data.orderId);
      } else {
        // console.error('[Confirmation] Statut de paiement inattendu:', data.status);
        throw new Error(`Statut de paiement inattendu: ${data.status}`);
      }
    } catch (err) {
      /*console.error('[Confirmation] Erreur dans handleConfirmPurchase:', {
        message: err.message,
        stack: err.stack,
      });*/
      setError(err instanceof Error ? err.message : 'Erreur réseau');
      router.push(`/checkout?error=${encodeURIComponent(err.message || 'Une erreur est survenue lors du paiement')}`);
    } finally {
      setIsProcessing(false);
      console.log('[Confirmation] handleConfirmPurchase terminé:', { isProcessing: false, error });
    }
  };

  const finalizeOrder = async (orderId: string) => {
    console.log('[Confirmation] Début de finalizeOrder:', { orderId });
    try {
      console.log('[Confirmation] Envoi de l’email de confirmation:', {
        to: session?.user?.email || localStorage.getItem('guestEmail'),
        orderId,
      });

      const emailResponse = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: session?.user?.email || localStorage.getItem('guestEmail'),
          subject: `Confirmation de votre commande #${orderId}`,
          html: `
            <h1>Merci pour votre commande !</h1>
            <p>Votre commande #${orderId} a été confirmée.</p>
            <p>Montant total: ${finalTotal.toFixed(2)} €</p>
            <p>Consultez votre facture dans votre espace client.</p>
          `,
        }),
      });

      console.log('[Confirmation] Réponse email:', {
        status: emailResponse.status,
        ok: emailResponse.ok,
      });

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        // console.error('[Confirmation] Échec de l’envoi de l’email:', errorText);
      }

      console.log('[Confirmation] Génération du PDF de la facture pour la commande:', orderId);
      await generateInvoicePDF({ id_order: orderId, total_amount: finalTotal });

      setCart([]);
      if (!session) {
        console.log('[Confirmation] Suppression des données invité de localStorage');
        localStorage.removeItem('guestCheckout');
        localStorage.removeItem('guestUserId');
        localStorage.removeItem('guestEmail');
        localStorage.removeItem('guestAddresses');
        localStorage.removeItem('guestPaymentInfos');
      }

      console.log('[Confirmation] Redirection vers success:', { orderId });
      router.push(`/success?orderId=${orderId}`);
    } catch (err) {
      /*console.error('[Confirmation] Erreur dans finalizeOrder:', {
        message: err.message,
        stack: err.stack,
      });*/
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la finalisation');
      router.push(`/checkout?error=${encodeURIComponent(err.message || 'Une erreur est survenue lors de la finalisation')}`);
    }
  };

  const generateInvoicePDF = async (order: any) => {
    console.log('[Confirmation] Début de generateInvoicePDF', { orderId: order.id_order });
    if (!address) {
      // console.error('[Confirmation] Adresse manquante pour générer le PDF');
      setError('Adresse manquante pour la génération de la facture');
      return;
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { height } = page.getSize();
    const fontSize = 12;

    page.drawText('Facture', {
      x: 50,
      y: height - 50,
      size: 20,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Numéro de commande: ${order.id_order}`, {
      x: 50,
      y: height - 80,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: 50,
      y: height - 100,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Client: ${session?.user?.email || localStorage.getItem('guestEmail') || 'Inconnu'}`, {
      x: 50,
      y: height - 120,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText('Articles:', {
      x: 50,
      y: height - 160,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    let y = height - 180;
    cart.forEach((item) => {
      const itemTotal = item.price * (item.subscription === 'YEARLY' ? 12 : 1) * item.quantity;
      page.drawText(
        `${item.name} (x${item.quantity}, ${item.subscription || 'MONTHLY'}): ${itemTotal.toFixed(2)} €`,
        {
          x: 50,
          y,
          size: fontSize,
          color: rgb(0, 0, 0),
        }
      );
      y -= 20;
    });

    page.drawText(`Sous-total: ${totalCartPrice.toFixed(2)} €`, {
      x: 50,
      y: y - 20,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Taxes (20%): ${taxes.toFixed(2)} €`, {
      x: 50,
      y: y - 40,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Total: ${finalTotal.toFixed(2)} €`, {
      x: 50,
      y: y - 60,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    page.drawText('Adresse de facturation:', {
      x: 50,
      y: y - 100,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`${address.first_name} ${address.last_name}`, {
      x: 50,
      y: y - 120,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(address.address1, {
      x: 50,
      y: y - 140,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    let addressY = y - 160;
    if (address.address2) {
      page.drawText(address.address2, {
        x: 50,
        y: addressY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      addressY -= 20;
    }

    page.drawText(`${address.postal_code} ${address.city}, ${address.country}`, {
      x: 50,
      y: addressY,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setInvoiceUrl(url);
    console.log('[Confirmation] PDF généré:', { invoiceUrl: url });
    return url;
  };

  useEffect(() => {
    console.log('[Confirmation] useEffect principal', { status, addressId, paymentId, cartelLength: cart.length, session });
    if (status === 'loading') {
      console.log('[Confirmation] Session en cours de chargement');
      return;
    }

    if (!session && !localStorage.getItem('guestUserId')) {
      console.log('[Confirmation] Redirection vers auth');
      router.push('/auth?redirect=/checkout/confirmation');
      return;
    }

    if (!addressId || !paymentId) {
      console.log('[Confirmation] Redirection vers checkout avec erreur');
      router.push('/checkout?error=Missing%20addressId%20or%20paymentId');
      return;
    }

    fetchData();
  }, [session, status, addressId, paymentId, router]);

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!address || !paymentInfo || cart.length === 0) {
    console.log('[Confirmation] Données manquantes:', {
      address: !!address,
      paymentInfo: !!paymentInfo,
      cartLength: cart.length,
    });
    return <p>Données manquantes ou panier vide. Veuillez retourner au checkout.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Confirmation de la commande</h1>
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          {cart.map((item) => (
            <div key={item.uniqueId} className="mb-2">
              <p>{item.name}</p>
              <p>Quantité: {item.quantity}</p>
              <p>Abonnement: {item.subscription || 'MONTHLY'}</p>
              <p>
                Total:{' '}
                {(item.price * (item.subscription === 'YEARLY' ? 12 : 1) * item.quantity).toFixed(2)} €
              </p>
            </div>
          ))}
          <p className="mt-4">Sous-total: {totalCartPrice.toFixed(2)} €</p>
          <p>Taxes (20%): {taxes.toFixed(2)} €</p>
          <p className="text-xl font-bold">Total final: {finalTotal.toFixed(2)} €</p>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Adresse de facturation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{address.first_name} {address.last_name}</p>
          <p>{address.address1}</p>
          {address.address2 && <p>{address.address2}</p>}
          <p>{address.postal_code} {address.city}, {address.country}</p>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Moyen de paiement</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{paymentInfo.card_name}</p>
          <p>**** {paymentInfo.last_card_digits}</p>
        </CardContent>
      </Card>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {invoiceUrl && (
        <Button asChild className="mt-4">
          <a href={invoiceUrl} download={`facture-${Date.now()}.pdf`}>
            Télécharger la facture
          </a>
        </Button>
      )}
      <Button
        className="mt-4 w-full"
        onClick={handleConfirmPurchase}
        disabled={isProcessing}
      >
        {isProcessing ? 'Traitement...' : 'Confirmer l’achat'}
      </Button>
    </div>
  );
}

export default function ConfirmationPage() {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
  }

  return (
    <Elements stripe={stripePromise}>
      <ConfirmationContent />
    </Elements>
  );
}