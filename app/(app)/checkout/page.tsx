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
  id_payment_info: string | number;
  card_name: string;
  last_card_digits: string;
  stripe_payment_id?: string;
  stripe_customer_id?: string;
  brand?: string;
}

function CheckoutContent() {
  const { data: session, status } = useSession();
  const { cart, setCart } = useCart();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [isGuest, setIsGuest] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
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

      let addressData: Address[] = [];
      if (addressResponse.ok) {
        addressData = await addressResponse.json();
        console.log('[CheckoutPage] Adresses récupérées:', {
          count: addressData.length,
          addresses: addressData.map(a => ({
            id: a.id_address,
            address1: a.address1,
            city: a.city,
          })),
        });
        setAddresses(Array.isArray(addressData) ? addressData : []);
        if (addressData.length > 0) {
          const firstAddressId = addressData[0].id_address.toString();
          console.log('[CheckoutPage] Sélection adresse par défaut:', { selectedAddress: firstAddressId });
          setSelectedAddress(firstAddressId);
        } else {
          console.warn('[CheckoutPage] Aucune adresse trouvée pour userId:', userId);
          setError('Aucune adresse enregistrée. Veuillez en ajouter une.');
          setSelectedAddress(null);
        }
      } else {
        const errorData = await addressResponse.json();
        console.error('[CheckoutPage] Erreur adresses:', errorData);
        setError(`Erreur lors du chargement des adresses: ${errorData.message || 'Erreur inconnue'}`);
      }

      let paymentData: PaymentInfo[] = [];
      if (paymentResponse.ok) {
        paymentData = await paymentResponse.json();
        console.log('[CheckoutPage] Moyens de paiement récupérés:', {
          count: paymentData.length,
          rawData: paymentData,
          paymentIds: paymentData.map((p: PaymentInfo) => ({
            id: p.id_payment_info,
            stripe_payment_id: p.stripe_payment_id,
            stripe_customer_id: p.stripe_customer_id,
            last4: p.last_card_digits,
            brand: p.brand,
          })),
        });
        setPaymentInfos(Array.isArray(paymentData) ? paymentData : []);
        if (paymentData.length > 0) {
          const firstPaymentId = String(paymentData[0].id_payment_info);
          console.log('[CheckoutPage] Sélection paiement par défaut:', { selectedPayment: firstPaymentId });
          setSelectedPayment(firstPaymentId);
        } else {
          console.warn('[CheckoutPage] Aucun moyen de paiement trouvé pour userId:', userId);
          setError('Aucun moyen de paiement enregistré. Veuillez en ajouter un.');
          setSelectedPayment(null);
        }
      } else {
        const errorData = await paymentResponse.json();
        console.error('[CheckoutPage] Erreur moyens de paiement:', errorData);
        setError(`Erreur lors du chargement des moyens de paiement: ${errorData.message || 'Erreur inconnue'}`);
      }

      if (selectedAddress && !addressData.some(a => a.id_address.toString() === selectedAddress)) {
        console.warn('[CheckoutPage] Réinitialisation selectedAddress invalide:', { selectedAddress });
        setSelectedAddress(addressData.length > 0 ? addressData[0].id_address.toString() : null);
      }
      if (selectedPayment && !paymentData.some(p => String(p.id_payment_info) === selectedPayment)) {
        console.warn('[CheckoutPage] Réinitialisation selectedPayment invalide:', { selectedPayment });
        setSelectedPayment(paymentData.length > 0 ? String(paymentData[0].id_payment_info) : null);
      }
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors du chargement des données utilisateur');
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

    if (!session) {
      setIsGuest(true);
      setSelectedAddress(null);
      setSelectedPayment(null);
      setAddresses([]);
      setPaymentInfos([]);
      setLoading(false);
      return;
    }

    if (!stripePromise) {
      setError('Clé Stripe manquante. Impossible de charger le formulaire de paiement.');
      setLoading(false);
      return;
    }

    const userId = session?.user?.id_user;
    if (userId) {
      setIsGuest(false);
      fetchUserData(parseInt(userId));
    } else {
      setIsGuest(true);
      setSelectedAddress(null);
      setSelectedPayment(null);
      setAddresses([]);
      setPaymentInfos([]);
      setLoading(false);
    }
  }, [session, status]);

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

    try {
      let userId = session?.user?.id_user;
      if (isGuest && !userId) {
        if (!guestEmail) {
          setError('Veuillez entrer un e-mail pour continuer en tant qu’invité');
          return;
        }
        const guestUserResponse = await fetch('/api/users/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: guestEmail }),
        });

        if (!guestUserResponse.ok) {
          const errorData = await guestUserResponse.json();
          console.error('[CheckoutPage] Erreur création utilisateur invité:', errorData);
          setError(`Erreur lors de la création de l’utilisateur invité: ${errorData.message || 'Erreur inconnue'}`);
          return;
        }

        const guestUser = await guestUserResponse.json();
        userId = guestUser.id_user;
        console.log('[CheckoutPage] Utilisateur invité créé:', { userId, email: guestEmail });
      }

      if (!userId) {
        setError('Utilisateur non identifié');
        return;
      }

      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
        },
        body: JSON.stringify({ ...newAddress, userId }),
      });

      if (response.ok) {
        const savedAddress = await response.json();
        setAddresses([...addresses, savedAddress]);
        setSelectedAddress(savedAddress.id_address.toString());
        console.log('[CheckoutPage] Nouvelle adresse sélectionnée:', { id_address: savedAddress.id_address });
      } else {
        const errorData = await response.json();
        console.error('[CheckoutPage] Erreur sauvegarde adresse:', errorData);
        setError(`Erreur lors de l'ajout de l'adresse: ${errorData.message || 'Erreur inconnue'}`);
      }
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors de l’ajout de l’adresse');
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
      userId: session?.user?.id_user || 'invité',
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

    try {
      let userId = session?.user?.id_user;
      if (isGuest && !userId) {
        if (!guestEmail) {
          setError('Veuillez entrer un e-mail pour continuer en tant qu’invité');
          return;
        }
        const guestUserResponse = await fetch('/api/users/guest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: guestEmail }),
        });

        if (!guestUserResponse.ok) {
          const errorData = await guestUserResponse.json();
          console.error('[CheckoutPage] Erreur création utilisateur invité:', errorData);
          setError(`Erreur lors de la création de l’utilisateur invité: ${errorData.message || 'Erreur inconnue'}`);
          return;
        }

        const guestUser = await guestUserResponse.json();
        userId = guestUser.id_user;
        console.log('[CheckoutPage] Utilisateur invité créé:', { userId, email: guestEmail });
      }

      if (!userId) {
        setError('Utilisateur non identifié');
        return;
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        console.error('[CheckoutPage] CardElement non trouvé');
        setError('Erreur avec le formulaire de paiement. Veuillez recharger la page.');
        return;
      }

      const customerResponse = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
        },
        body: JSON.stringify({
          email: isGuest ? guestEmail : session?.user?.email,
          name: newPayment.card_name,
        }),
      });

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json();
        console.error('[CheckoutPage] Erreur création client Stripe:', errorData);
        setError(`Erreur lors de la création du client Stripe: ${errorData.message || 'Erreur inconnue'}`);
        return;
      }

      const { customerId } = await customerResponse.json();
      console.log('[CheckoutPage] Client Stripe créé:', { customerId });

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: newPayment.card_name, email: isGuest ? guestEmail : undefined },
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

      await fetch('/api/stripe/attach-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId,
        }),
      });

      console.log('[CheckoutPage] Données envoyées à /api/users/payment-infos:', {
        userId,
        card_name: newPayment.card_name,
        stripe_payment_id: paymentMethod.id,
        stripe_customer_id: customerId,
        last_card_digits: paymentMethod.card.last4,
        brand: paymentMethod.card.brand,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
      });

      const response = await fetch('/api/users/payment-infos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
        },
        body: JSON.stringify({
          userId,
          card_name: newPayment.card_name,
          stripe_payment_id: paymentMethod.id,
          stripe_customer_id: customerId,
          last_card_digits: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
        }),
      });

      if (response.ok) {
        const savedPayment = await response.json();
        setPaymentInfos([...paymentInfos, savedPayment]);
        setSelectedPayment(String(savedPayment.id_payment_info));
        console.log('[CheckoutPage] Nouveau moyen de paiement sélectionné:', { id_payment_info: savedPayment.id_payment_info });
      } else {
        const errorData = await response.json();
        console.error('[CheckoutPage] Erreur API:', errorData);
        setError(`Erreur lors de l'ajout du moyen de paiement: ${errorData.message || 'Erreur inconnue'}`);
      }

      setNewPayment({ card_name: '' });
      cardElement.clear();
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors de l’ajout du moyen de paiement');
    }
  };

  const handleProceedToPayment = async () => {
    console.log('[CheckoutPage] Tentative de traitement du paiement:', {
      isGuest,
      guestEmail,
      selectedAddress,
      selectedPayment,
      cart,
      availablePaymentIds: paymentInfos.map(p => String(p.id_payment_info)),
      availableAddressIds: addresses.map(a => a.id_address.toString()),
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

    if (!selectedAddress || !addresses.some(a => a.id_address.toString() === selectedAddress)) {
      console.error('[CheckoutPage] Adresse invalide:', {
        selectedAddress,
        availableAddressIds: addresses.map(a => a.id_address.toString()),
      });
      setError('Veuillez sélectionner une adresse valide');
      return;
    }

    if (!selectedPayment || !paymentInfos.some(p => String(p.id_payment_info) === selectedPayment)) {
      console.error('[CheckoutPage] Moyen de paiement invalide:', {
        selectedPayment,
        availablePaymentIds: paymentInfos.map(p => String(p.id_payment_info)),
      });
      setError('Veuillez sélectionner un moyen de paiement valide');
      return;
    }

    let userId = session?.user?.id_user;
    if (isGuest) {
      if (!guestEmail) {
        setError('Veuillez entrer un e-mail pour continuer en tant qu’invité');
        return;
      }
      const guestUserResponse = await fetch('/api/users/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guestEmail }),
      });

      if (!guestUserResponse.ok) {
        const errorData = await guestUserResponse.json();
        console.error('[CheckoutPage] Erreur création utilisateur invité:', errorData);
        setError(`Erreur lors de la création de l’utilisateur invité: ${errorData.message || 'Erreur inconnue'}`);
        return;
      }

      const guestUser = await guestUserResponse.json();
      userId = guestUser.id_user;
      console.log('[CheckoutPage] Utilisateur invité utilisé:', { userId, email: guestEmail });
    }

    if (!userId) {
      setError('Utilisateur non identifié');
      return;
    }

    const selectedPaymentInfo = paymentInfos.find(
      (p: PaymentInfo) => String(p.id_payment_info) === selectedPayment
    );
    if (!selectedPaymentInfo || !selectedPaymentInfo.stripe_payment_id) {
      console.error('[CheckoutPage] Moyen de paiement invalide ou informations Stripe manquantes:', {
        selectedPayment,
        selectedPaymentInfo,
        paymentInfos: paymentInfos.map(p => ({
          id_payment_info: p.id_payment_info,
          stripe_payment_id: p.stripe_payment_id,
          stripe_customer_id: p.stripe_customer_id,
        })),
      });
      setError('Le moyen de paiement sélectionné est invalide ou non configuré. Veuillez en ajouter un nouveau.');
      return;
    }

    try {
      const sessionToken = isGuest ? 'guest' : userId.toString();
      const stripe_payment_id = selectedPaymentInfo.stripe_payment_id;
      const stripe_customer_id = selectedPaymentInfo.stripe_customer_id; // Peut être undefined

      console.log('[CheckoutPage] Données de paiement:', {
        selectedPayment,
        stripe_payment_id,
        stripe_customer_id,
        last4: selectedPaymentInfo.last_card_digits,
        brand: selectedPaymentInfo.brand,
      });

      const addressIdToSend = parseInt(selectedAddress).toString();
      const paymentIdToSend = parseInt(selectedPayment).toString();

      console.log('[CheckoutPage] Envoi à /api/checkout:', {
        cartItems: cart,
        addressId: addressIdToSend,
        paymentId: paymentIdToSend,
        guestId: isGuest ? userId : undefined,
        guestEmail: isGuest ? guestEmail : undefined,
        sessionToken,
        stripe_payment_id,
      });

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId.toString(),
        },
        body: JSON.stringify({
          cartItems: cart,
          addressId: addressIdToSend,
          paymentId: paymentIdToSend,
          guestId: isGuest ? userId : undefined,
          guestEmail: isGuest ? guestEmail : undefined,
          sessionToken,
          stripe_payment_id,
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('[CheckoutPage] Paiement réussi:', {
          orderId: responseData.orderId,
          paymentIntentId: responseData.paymentIntentId,
        });
        setCart([]);
        router.push(`/checkout/success?orderId=${responseData.orderId}`);
      } else {
        console.error('[CheckoutPage] Échec du paiement:', responseData);
        setError(
          responseData.error.includes('Moyen de paiement')
            ? 'Le moyen de paiement sélectionné est invalide ou non configuré. Veuillez en ajouter un nouveau.'
            : `Paiement échoué : ${responseData.error || 'Erreur inconnue'}`
        );
      }
    } catch (err) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors du traitement du paiement');
    }
  };

  if (status === 'loading') {
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
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Continuer en tant qu'invité</CardTitle>
            <CardDescription>Entrez votre e-mail pour continuer</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="E-mail"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="mb-2"
            />
            <p className="text-sm text-gray-600">
              Vous pouvez également <a href="/login" className="text-blue-600">vous connecter</a> ou{' '}
              <a href="/signup" className="text-blue-600">créer un compte</a>.
            </p>
          </CardContent>
        </Card>
      )}
      {!isGuest && !session && (
        <div className="mb-4">
          <p className="mb-4">Veuillez vous connecter ou vous inscrire pour continuer.</p>
          <AuthTabs />
        </div>
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
              <Select
                onValueChange={(value) => {
                  console.log('[CheckoutPage] Adresse sélectionnée:', { value });
                  setSelectedAddress(value);
                }}
                value={selectedAddress || ''}
                disabled={addresses.length === 0}
              >
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
              <Select
                onValueChange={(value) => {
                  console.log('[CheckoutPage] Moyen de paiement sélectionné:', { value });
                  setSelectedPayment(value);
                }}
                value={selectedPayment || ''}
                disabled={paymentInfos.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un moyen de paiement" />
                </SelectTrigger>
                <SelectContent>
                  {paymentInfos.map((payment) => (
                    <SelectItem key={payment.id_payment_info} value={String(payment.id_payment_info)}>
                      {payment.card_name} - {payment.brand || 'Carte'} **** {payment.last_card_digits}
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
        disabled={
          loading ||
          !stripe ||
          !elements ||
          !selectedAddress ||
          !selectedPayment ||
          cart.length === 0 ||
          !addresses.some(a => a.id_address.toString() === selectedAddress) ||
          !paymentInfos.some(p => String(p.id_payment_info) === selectedPayment)
        }
      >
        Confirmer le paiement
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