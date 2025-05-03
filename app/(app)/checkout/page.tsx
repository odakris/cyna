'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AuthTabs from '@/components/Auth/AuthTabs';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useCart } from '@/context/CartContext';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
if (!stripeKey) {
  console.error('[CheckoutPage] NEXT_PUBLIC_STRIPE_PUBLIC_KEY manquante');
}
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface CartItem {
  id: string;
  uniqueId: string;
  name: string;
  price: number;
  quantity: number;
  subscription_type?: string;
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

function CheckoutContent() {
  const { data: session, status } = useSession();
  const { cart, setCart } = useCart();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentInfos, setPaymentInfos] = useState<PaymentInfo[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    first_name: '',
    last_name: '',
    address1: '',
    address2: '',
    postal_code: '',
    city: '',
    country: '',
    mobile_phone: '',
  });
  const [newPayment, setNewPayment] = useState({
    card_name: '',
  });
  const [guestEmail, setGuestEmail] = useState('');
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (userId: number) => {
    console.log('[CheckoutPage] Récupération des données utilisateur:', { userId });
    try {
      const [addressResponse, paymentResponse] = await Promise.all([
        fetch('/api/users/addresses', {
          headers: { 'x-user-id': userId.toString() },
        }),
        fetch('/api/users/payment-infos', {
          headers: { 'x-user-id': userId.toString() },
        }),
      ]);

      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        console.log('[CheckoutPage] Adresses récupérées:', addressData);
        setAddresses(Array.isArray(addressData) ? addressData : []);
        if (addressData.length > 0) {
          setSelectedAddress(addressData[0].id_address.toString());
        } else {
          console.warn('[CheckoutPage] Aucune adresse trouvée pour userId:', userId);
        }
      } else {
        const errorData = await addressResponse.json();
        console.error('[CheckoutPage] Erreur adresses:', errorData);
        setError(`Erreur lors du chargement des adresses: ${errorData.message || 'Erreur inconnue'}`);
      }

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('[CheckoutPage] Moyens de paiement récupérés:', paymentData);
        setPaymentInfos(Array.isArray(paymentData) ? paymentData : []);
        if (paymentData.length > 0) {
          setSelectedPayment(paymentData[0].id_payment_info.toString());
        } else {
          console.warn('[CheckoutPage] Aucun moyen de paiement trouvé pour userId:', userId);
        }
      } else {
        const errorData = await paymentResponse.json();
        console.error('[CheckoutPage] Erreur moyens de paiement:', errorData);
        setError(`Erreur lors du chargement des moyens de paiement: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors du chargement des données utilisateur');
    } finally {
      setLoading(false);
    }
  };

  const loadGuestData = () => {
    console.log('[CheckoutPage] Chargement des données invité...');
    try {
      const storedAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
      const storedPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');
      console.log('[CheckoutPage] Données invité:', { storedAddresses, storedPayments });
      setAddresses(Array.isArray(storedAddresses) ? storedAddresses : []);
      setPaymentInfos(Array.isArray(storedPayments) ? storedPayments : []);
      if (storedAddresses.length > 0) {
        setSelectedAddress(storedAddresses[0].id_address);
      }
      if (storedPayments.length > 0) {
        setSelectedPayment(storedPayments[0].id_payment_info);
      }
    } catch (err) {
      console.error('[CheckoutPage] Erreur lecture localStorage:', err);
      setError('Erreur lors du chargement des données invité');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[CheckoutPage] Session details:', {
      userId: session?.user?.id_user,
      session,
      cart,
      stripeKey: stripeKey ? 'présente' : 'manquante',
    });
    if (status === 'loading') return;

    if (!session && !isGuest) {
      setLoading(false);
      return;
    }

    if (!stripePromise) {
      setError('Clé Stripe manquante. Impossible de charger le formulaire de paiement.');
      setLoading(false);
      return;
    }

    const userId = session?.user?.id_user;
    const guestId = localStorage.getItem('guestSessionId');
    if (userId) {
      fetchUserData(parseInt(userId));
    } else if (guestId) {
      loadGuestData();
    } else {
      setLoading(false);
    }
  }, [session, status, isGuest]);

  const handleGuestCheckout = async () => {
    console.log('[CheckoutPage] Tentative de checkout invité:', { guestEmail });
    setError(null);

    if (!guestEmail) {
      console.error('[CheckoutPage] E-mail vide');
      setError('Veuillez entrer un e-mail pour continuer en tant qu’invité');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      console.error('[CheckoutPage] E-mail invalide:', guestEmail);
      setError('Veuillez entrer un e-mail valide');
      return;
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmail }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[CheckoutPage] Erreur création session:', errorData);
        setError(`Erreur lors de la création de la session: ${errorData.message || 'Erreur inconnue'}`);
        return;
      }
      const sessionData = await response.json();
      const guestId = sessionData.id_session;
      localStorage.setItem('guestCheckout', 'true');
      localStorage.setItem('guestSessionId', guestId.toString());
      localStorage.setItem('guestEmail', guestEmail);
      console.log('[CheckoutPage] Invité initialisé:', { guestId, guestEmail });
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors de l’initialisation de la session invité');
      return;
    }

    setIsGuest(true);
    loadGuestData();
  };

  const handleSaveNewAddress = async () => {
    console.log('[CheckoutPage] Sauvegarde nouvelle adresse:', newAddress);
    setError(null);

    if (
      !newAddress.first_name ||
      !newAddress.last_name ||
      !newAddress.address1 ||
      !newAddress.postal_code ||
      !newAddress.city ||
      !newAddress.country ||
      !newAddress.mobile_phone
    ) {
      setError('Veuillez remplir tous les champs obligatoires de l’adresse');
      return;
    }

    const addressId = `addr_${Date.now()}`;
    const newAddressData: Address = {
      id_address: addressId,
      ...newAddress,
    };

    if (session?.user?.id_user) {
      try {
        const response = await fetch('/api/users/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user.id_user.toString(),
          },
          body: JSON.stringify({ ...newAddress, userId: session.user.id_user }),
        });

        if (response.ok) {
          const savedAddress = await response.json();
          setAddresses([...addresses, savedAddress]);
          setSelectedAddress(savedAddress.id_address.toString());
        } else {
          const errorData = await response.json();
          console.error('[CheckoutPage] Erreur sauvegarde adresse:', errorData);
          setError(`Erreur lors de l'ajout de l'adresse: ${errorData.message || 'Erreur inconnue'}`);
        }
      } catch (err) {
        console.error('[CheckoutPage] Erreur réseau:', err);
        setError('Erreur réseau lors de l’ajout de l’adresse');
      }
    } else {
      const currentAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
      currentAddresses.push(newAddressData);
      localStorage.setItem('guestAddresses', JSON.stringify(currentAddresses));
      setAddresses(currentAddresses);
      setSelectedAddress(addressId);
    }

    setNewAddress({
      first_name: '',
      last_name: '',
      address1: '',
      address2: '',
      postal_code: '',
      city: '',
      country: '',
      mobile_phone: '',
    });
  };

  const handleSaveNewPayment = async () => {
    console.log('[CheckoutPage] Sauvegarde nouveau moyen de paiement:', {
      card_name: newPayment.card_name,
      userId: session?.user?.id_user,
    });
    setError(null);

    if (!stripe || !elements) {
      console.error('[CheckoutPage] Stripe non chargé:', { stripe, elements });
      setError('Erreur de chargement de Stripe. Veuillez recharger la page.');
      return;
    }

    if (!newPayment.card_name) {
      console.error('[CheckoutPage] Nom de carte manquant');
      setError('Veuillez entrer un nom pour la carte');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('[CheckoutPage] CardElement non trouvé');
      setError('Erreur avec le formulaire de paiement. Veuillez recharger la page.');
      return;
    }

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: newPayment.card_name },
      });

      if (error) {
        console.error('[CheckoutPage] Erreur Stripe:', error);
        setError(error.message || 'Erreur lors de l’ajout du moyen de paiement');
        return;
      }

      if (!paymentMethod?.id || !paymentMethod?.card?.last4 || !paymentMethod?.card?.brand) {
        console.error('[CheckoutPage] Données Stripe incomplètes:', paymentMethod);
        setError('Données de paiement Stripe incomplètes');
        return;
      }

      const paymentId = `pay_${Date.now()}`;
      const newPaymentData: PaymentInfo = {
        id_payment_info: paymentId,
        card_name: newPayment.card_name,
        last_card_digits: paymentMethod.card.last4,
        stripe_payment_id: paymentMethod.id,
      };

      if (session?.user?.id_user) {
        console.log('[CheckoutPage] Envoi à /api/users/payment-infos:', {
          userId: session.user.id_user,
          card_name: newPayment.card_name,
          stripe_payment_id: paymentMethod.id,
          last_card_digits: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
        });
        const response = await fetch('/api/users/payment-infos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user.id_user.toString(),
          },
          body: JSON.stringify({
            userId: session.user.id_user,
            card_name: newPayment.card_name,
            stripe_payment_id: paymentMethod.id,
            last_card_digits: paymentMethod.card.last4,
            brand: paymentMethod.card.brand,
          }),
        });

        if (response.ok) {
          const savedPayment = await response.json();
          console.log('[CheckoutPage] Moyen de paiement enregistré:', savedPayment);
          setPaymentInfos([...paymentInfos, savedPayment]);
          setSelectedPayment(savedPayment.id_payment_info.toString());
        } else {
          const errorData = await response.json();
          console.error('[CheckoutPage] Erreur API:', errorData);
          setError(`Erreur lors de l'ajout du moyen de paiement: ${errorData.message || 'Erreur inconnue'}`);
        }
      } else {
        const currentPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');
        currentPayments.push(newPaymentData);
        localStorage.setItem('guestPaymentInfos', JSON.stringify(currentPayments));
        setPaymentInfos(currentPayments);
        setSelectedPayment(paymentId);
      }

      setNewPayment({ card_name: '' });
      cardElement.clear();
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors de l’ajout du moyen de paiement');
    }
  };

  const handleProceedToPayment = async () => {
    console.log('[CheckoutPage] Tentative de création session Stripe:', {
      selectedAddress,
      selectedPayment,
      cart,
    });
    setError(null);

    if (!cart || cart.length === 0) {
      setError('Votre panier est vide');
      return;
    }

    for (const item of cart) {
      if (
        !item.id ||
        !item.uniqueId ||
        !item.name ||
        typeof item.price !== 'number' ||
        typeof item.quantity !== 'number'
      ) {
        console.error('[CheckoutPage] Élément de panier invalide:', item);
        setError('Un ou plusieurs éléments du panier sont invalides');
        return;
      }
    }

    if (!selectedAddress) {
      setError('Veuillez sélectionner une adresse');
      return;
    }

    if (!selectedPayment) {
      setError('Veuillez sélectionner un moyen de paiement');
      return;
    }

    if (!stripe) {
      console.error('[CheckoutPage] Stripe non chargé');
      setError('Erreur de chargement de Stripe. Veuillez recharger la page.');
      return;
    }

    try {
      const guestId = localStorage.getItem('guestSessionId');
      const guestEmail = localStorage.getItem('guestEmail');
      const sessionToken = session?.user?.id_user?.toString();

      // Récupérer stripe_payment_id pour les invités
      let stripe_payment_id: string | undefined;
      if (selectedPayment.startsWith('pay_')) {
        const guestPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');
        const selectedPaymentInfo = guestPayments.find(
          (p: PaymentInfo) => p.id_payment_info === selectedPayment
        );
        stripe_payment_id = selectedPaymentInfo?.stripe_payment_id;
      }

      // Validation temporaire pour les IDs non entiers des invités
      const addressIdToSend = selectedAddress.startsWith('addr_')
        ? selectedAddress
        : parseInt(selectedAddress).toString();
      const paymentIdToSend = selectedPayment.startsWith('pay_')
        ? selectedPayment
        : parseInt(selectedPayment).toString();

      console.log('[CheckoutPage] Envoi à /api/checkout:', {
        cartItems: cart,
        addressId: addressIdToSend,
        paymentId: paymentIdToSend,
        guestId: guestId || '',
        guestEmail: guestEmail || '',
        sessionToken: sessionToken || 'guest',
        stripe_payment_id,
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken && { 'x-user-id': sessionToken }),
        },
        body: JSON.stringify({
          cartItems: cart,
          addressId: addressIdToSend,
          paymentId: paymentIdToSend,
          guestId: guestId || '',
          guestEmail: guestEmail || '',
          sessionToken: sessionToken || 'guest',
          stripe_payment_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[CheckoutPage] Erreur création session Stripe:', errorData);
        setError(`Erreur lors de la création de la session de paiement: ${errorData.error || 'Erreur inconnue'}`);
        return;
      }

      const { sessionId } = await response.json();
      console.log('[CheckoutPage] Session Stripe créée:', { sessionId });

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('[CheckoutPage] Erreur redirection Stripe:', error);
        setError(error.message || 'Erreur lors de la redirection vers Stripe');
      }
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors de la création de la session de paiement');
    }
  };

  if (!session && !isGuest) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Checkout</h1>
        <p className="mb-4">Connectez-vous, inscrivez-vous ou continuez en tant qu’invité.</p>
        <AuthTabs />
        <div className="mt-4">
          <Input
            type="email"
            placeholder="Entrez votre e-mail pour continuer en tant qu’invité"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="mb-2"
          />
          <Button className="w-full" variant="outline" onClick={handleGuestCheckout}>
            Continuer en tant qu’invité
          </Button>
          <p className="mt-2 text-sm text-yellow-500">
            Note : Vous devrez créer un compte pour gérer vos abonnements.
          </p>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return <p>Chargement...</p>;
  }

  const totalCartPrice = cart.reduce((sum, item) => {
    let unitPrice = item.price;
    switch (item.subscription_type || 'MONTHLY') {
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Passer la commande</h1>
      {isGuest && (
        <p className="mb-4 text-yellow-500">
          Vous êtes en mode invité. Si vous avez déjà enregistré un moyen de paiement, il sera utilisé automatiquement. Sinon, vous devrez entrer vos informations de paiement sur la page Stripe. Créez un compte pour enregistrer vos informations de paiement.
        </p>
      )}
      {!stripePromise && (
        <p className="text-red-500 mb-4">
          Erreur de configuration Stripe. Veuillez contacter le support.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <p className="text-yellow-500">Votre panier est vide.</p>
            ) : (
              cart.map((item) => (
                <div key={item.uniqueId} className="mb-2">
                  <p>{item.name}</p>
                  <p>Quantité : {item.quantity}</p>
                  <p>Abonnement : {item.subscription_type}</p>
                  <p>
                    Total :{' '}
                    {(item.price * (item.subscription_type === 'YEARLY' ? 12 : 1) * item.quantity).toFixed(2)} €
                  </p>
                </div>
              ))
            )}
            <p className="text-xl font-bold mt-4">
              Total : {totalCartPrice.toFixed(2)} €
            </p>
          </CardContent>
        </Card>
        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Adresse de facturation</CardTitle>
              <CardDescription>Sélectionnez ou ajoutez une adresse</CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length === 0 && (
                <p className="text-yellow-500 mb-2">
                  Aucune adresse enregistrée. Veuillez en ajouter une.
                </p>
              )}
              <Select onValueChange={(value) => setSelectedAddress(value)} value={selectedAddress || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une adresse" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((address) => (
                    <SelectItem key={address.id_address} value={address.id_address.toString()}>
                      {address.address1}, {address.city}, {address.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Ajouter une nouvelle adresse</h3>
                <Input
                  placeholder="Prénom"
                  value={newAddress.first_name}
                  onChange={(e) => setNewAddress({ ...newAddress, first_name: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Nom"
                  value={newAddress.last_name}
                  onChange={(e) => setNewAddress({ ...newAddress, last_name: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Adresse ligne 1"
                  value={newAddress.address1}
                  onChange={(e) => setNewAddress({ ...newAddress, address1: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Adresse ligne 2 (optionnel)"
                  value={newAddress.address2}
                  onChange={(e) => setNewAddress({ ...newAddress, address2: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Code postal"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Ville"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Pays"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="mt-2"
                />
                <Input
                  placeholder="Téléphone"
                  value={newAddress.mobile_phone}
                  onChange={(e) => setNewAddress({ ...newAddress, mobile_phone: e.target.value })}
                  className="mt-2"
                />
                <Button className="mt-2" onClick={handleSaveNewAddress}>
                  Ajouter l’adresse
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Moyen de paiement</CardTitle>
              <CardDescription>Sélectionnez ou ajoutez un moyen de paiement</CardDescription>
            </CardHeader>
            <CardContent>
              {paymentInfos.length === 0 && (
                <p className="text-yellow-500 mb-2">
                  Aucun moyen de paiement enregistré. Veuillez en ajouter un.
                </p>
              )}
              <Select onValueChange={(value) => setSelectedPayment(value)} value={selectedPayment || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un moyen de paiement" />
                </SelectTrigger>
                <SelectContent>
                  {paymentInfos.map((payment) => (
                    <SelectItem key={payment.id_payment_info} value={payment.id_payment_info.toString()}>
                      {payment.card_name} - **** {payment.last_card_digits}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Ajouter un nouveau moyen de paiement</h3>
                <Input
                  placeholder="Nom sur la carte"
                  value={newPayment.card_name}
                  onChange={(e) => setNewPayment({ ...newPayment, card_name: e.target.value })}
                  className="mt-2"
                />
                {stripePromise ? (
                  <CardElement className="mt-2 p-2 border rounded" />
                ) : (
                  <p className="text-red-500 mt-2">
                    Formulaire de paiement indisponible. Veuillez vérifier la configuration Stripe.
                  </p>
                )}
                <Button
                  className="mt-2"
                  onClick={handleSaveNewPayment}
                  disabled={loading || !stripe || !elements}
                >
                  Ajouter le moyen de paiement
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <Button
        className="mt-4 w-full"
        onClick={handleProceedToPayment}
        disabled={loading || !stripe || !elements}
      >
        Procéder au paiement
      </Button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}