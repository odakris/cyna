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
import { nanoid } from 'nanoid';
import { useCart } from '@/context/CartContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
        fetch(`/api/users/addresses?userId=${userId}`, {
          headers: { 'x-user-id': userId.toString() },
        }),
        fetch(`/api/users/payment-infos?userId=${userId}`, {
          headers: { 'x-user-id': userId.toString() },
        }),
      ]);

      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        console.log('[CheckoutPage] Adresses récupérées:', addressData);
        setAddresses(addressData);
      } else {
        const addressError = await addressResponse.text();
        console.error('[CheckoutPage] Erreur adresses:', addressError);
        setError(`Erreur lors du chargement des adresses: ${addressError}`);
      }

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('[CheckoutPage] Moyens de paiement récupérés:', paymentData);
        setPaymentInfos(paymentData);
      } else {
        const paymentError = await paymentResponse.text();
        console.error('[CheckoutPage] Erreur moyens de paiement:', paymentError);
        setError(`Erreur lors du chargement des moyens de paiement: ${paymentError}`);
      }
    } catch (err: any) {
      console.error('[CheckoutPage] Erreur réseau (user data):', err);
      setError('Erreur réseau lors du chargement des données utilisateur');
    }
  };

  const loadGuestData = () => {
    console.log('[CheckoutPage] Chargement des données invité...');
    const storedAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
    const storedPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');
    console.log('[CheckoutPage] Données invité:', { storedAddresses, storedPayments });
    setAddresses(storedAddresses);
    setPaymentInfos(storedPayments);
  };

  const loadUserData = async (userId: string) => {
    console.log('[CheckoutPage] Chargement des données utilisateur...');
  
    try {
      // Récupérer les informations de l'utilisateur via une API ou une autre méthode
      const userAddressesResponse = await fetch(`/api/user/${userId}/addresses`);
      const userPaymentsResponse = await fetch(`/api/user/${userId}/payment-info`);
  
      if (!userAddressesResponse.ok || !userPaymentsResponse.ok) {
        throw new Error('Erreur lors du chargement des données utilisateur.');
      }
  
      const userAddresses = await userAddressesResponse.json();
      const userPayments = await userPaymentsResponse.json();
  
      console.log('[CheckoutPage] Données utilisateur:', { userAddresses, userPayments });
  
      // Mise à jour de l'état avec les données récupérées
      setAddresses(userAddresses);
      setPaymentInfos(userPayments);
    } catch (error) {
      console.error('[CheckoutPage] Erreur lors du chargement des données utilisateur:', error);
      // Si une erreur se produit, on pourrait peut-être définir des valeurs par défaut ou gérer l'erreur d'une autre manière
    }
  };
  

  useEffect(() => {
    console.log('[CheckoutPage] Session details:', {
      userId: session?.user?.id,
      session,
    });
    if (status === 'loading') return;

    if (!session && !isGuest) {
      setLoading(false);
      return;
    }

    const userId = session?.user?.id;
    const guestId = localStorage.getItem('guestUserId');
    if (userId) {
      fetchUserData(parseInt(userId));
    } else if (guestId) {
      loadGuestData();
    }
    setLoading(false);
  }, [session, status, isGuest]);

  const handleGuestCheckout = async () => {
    console.log('[CheckoutPage] Tentative de checkout invité:', { guestEmail });
    setError(null);

    if (!guestEmail) {
      console.error('[CheckoutPage] E-mail vide');
      setError('Veuillez entrer un e-mail pour continuer en tant qu’invité');
      return;
    }
    if (!guestEmail.includes('@') || !guestEmail.includes('.')) {
      console.error('[CheckoutPage] E-mail invalide:', guestEmail);
      setError('Veuillez entrer un e-mail valide');
      return;
    }

    const guestId = nanoid(8);
    localStorage.setItem('guestCheckout', 'true');
    localStorage.setItem('guestUserId', guestId);
    localStorage.setItem('guestEmail', guestEmail);
    console.log('[CheckoutPage] Invité initialisé:', { guestId, guestEmail });

    setIsGuest(true);
    await useCart();
    loadGuestData();
  };

  const handleSaveNewAddress = async () => {
    console.log('[CheckoutPage] Sauvegarde nouvelle adresse:', newAddress);
    if (
      !newAddress.first_name ||
      !newAddress.address1 ||
      !newAddress.postal_code ||
      !newAddress.city ||
      !newAddress.country
    ) {
      setError('Veuillez remplir tous les champs obligatoires de l’adresse');
      return;
    }

    const addressId = nanoid(8);
    const newAddressData: Address = {
      id_address: addressId,
      ...newAddress,
    };

    if (session?.user?.id) {
      try {
        const response = await fetch('/api/users/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user.id,
          },
          body: JSON.stringify({ ...newAddress, userId: session.user.id }),
        });

        if (response.ok) {
          const savedAddress = await response.json();
          setAddresses([...addresses, savedAddress]);
          setSelectedAddress(savedAddress.id_address.toString());
        } else {
          const errorData = await response.text();
          console.error('[CheckoutPage] Erreur sauvegarde adresse:', errorData);
          setError(`Erreur lors de l'ajout de l'adresse: ${errorData}`);
        }
      } catch (err: any) {
        console.error('[CheckoutPage] Erreur réseau:', err);
        setError('Erreur réseau');
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
      userId: session?.user?.id,
    });
    if (!stripe || !elements) {
      console.error('[CheckoutPage] Stripe non chargé:', { stripe, elements });
      setError('Stripe non chargé');
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
      setError('Erreur avec le formulaire de paiement');
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

      const paymentId = nanoid(8);
      const newPaymentData: PaymentInfo = {
        id_payment_info: paymentId,
        card_name: newPayment.card_name,
        last_card_digits: paymentMethod.card.last4,
        stripe_payment_id: paymentMethod.id,
      };

      if (session?.user?.id) {
        console.log('[CheckoutPage] Envoi à /api/users/payment-infos:', {
          userId: session.user.id,
          card_name: newPayment.card_name,
          stripe_payment_id: paymentMethod.id,
          last_card_digits: paymentMethod.card.last4,
          brand: paymentMethod.card.brand,
        });
        const response = await fetch('/api/users/payment-infos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user.id,
          },
          body: JSON.stringify({
            userId: session.user.id,
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
          const errorData = await response.text();
          console.error('[CheckoutPage] Erreur API:', errorData);
          setError(`Erreur lors de l'ajout du moyen de paiement: ${errorData}`);
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
    } catch (err: any) {
      console.error('[CheckoutPage] Erreur réseau:', err);
      setError('Erreur réseau lors de l’ajout du moyen de paiement');
    }
  };

  const handleProceedToConfirmation = () => {
    console.log('[CheckoutPage] Passage à la confirmation:', { selectedAddress, selectedPayment });
    if (!selectedAddress || !selectedPayment) {
      setError('Veuillez sélectionner une adresse et un moyen de paiement');
      return;
    }

    router.push(`/checkout/confirmation?addressId=${selectedAddress}&paymentId=${selectedPayment}`);
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
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Passer la commande</h1>
      {isGuest && (
        <p className="mb-4 text-yellow-500">
          Vous êtes en mode invité. Vous devrez créer un compte pour gérer vos abonnements.
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
                  <p>Abonnement : {item.subscription}</p>
                  <p>
                    Total :{' '}
                    {(item.price * (item.subscription === 'YEARLY' ? 12 : 1) * item.quantity).toFixed(2)} €
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
              <Select onValueChange={(value) => setSelectedAddress(value)}>
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
              <Select onValueChange={(value) => setSelectedPayment(value)}>
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
                <CardElement className="mt-2 p-2 border rounded" />
                <Button
                  className="mt-2"
                  onClick={handleSaveNewPayment}
                  disabled={loading}
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
        onClick={handleProceedToConfirmation}
        disabled={loading}
      >
        Continuer vers la confirmation
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