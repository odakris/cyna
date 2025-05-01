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

function CheckoutContent() {
  const { data: session, status } = useSession();
  const { cart } = useCart();
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

  const fetchUserData = async (userId: string) => {
    console.log('[Checkout] Récupération des données utilisateur:', { userId });
    try {
      console.log('[Checkout] Envoi des requêtes API...');
      const [addressResponse, paymentResponse] = await Promise.all([
        fetch(`/api/users/addresses`, {
          credentials: 'include',
        }),
        fetch(`/api/users/payment-infos`, {
          credentials: 'include',
        }),
      ]);

      console.log('[Checkout] Réponses reçues:', {
        addressStatus: addressResponse.status,
        paymentStatus: paymentResponse.status,
      });

      if (addressResponse.ok) {
        const addressData = await addressResponse.json();
        console.log('[Checkout] Adresses récupérées:', addressData);
        setAddresses(addressData);
      } else {
        const addressError = await addressResponse.text();
        console.error('[Checkout] Erreur adresses:', {
          status: addressResponse.status,
          error: addressError,
        });
        setError(`Erreur lors du chargement des adresses: ${addressResponse.status === 500 ? 'Erreur serveur interne' : addressError}`);
      }

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('[Checkout] Moyens de paiement récupérés:', paymentData);
        setPaymentInfos(paymentData);
      } else {
        const paymentError = await paymentResponse.text();
        console.error('[Checkout] Erreur moyens de paiement:', {
          status: paymentResponse.status,
          error: paymentError,
        });
        setError(`Erreur lors du chargement des moyens de paiement: ${paymentError}`);
      }
    } catch (err) {
      console.error('[Checkout] Erreur réseau:', err);
      setError('Erreur réseau lors du chargement des données utilisateur');
    }
  };

  const loadGuestData = () => {
    console.log('[Checkout] Chargement des données invité');
    const storedAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
    const storedPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');
    console.log('[Checkout] Données invité:', { storedAddresses, storedPayments });
    setAddresses(storedAddresses);
    setPaymentInfos(storedPayments);
  };

  useEffect(() => {
    console.log('[Checkout] useEffect démarré', {
      status,
      session: session ? 'présente' : 'absente',
      userId: session?.user?.id_user,
      isGuest,
    });
    if (status === 'loading') {
      console.log('[Checkout] Statut en chargement, attente...');
      return;
    }

    if (!session && !isGuest) {
      console.log('[Checkout] Pas de session ni mode invité, affichage formulaire');
      setLoading(false);
      return;
    }

    const userId = session?.user?.id_user;
    const guestId = localStorage.getItem('guestUserId');
    if (userId) {
      console.log('[Checkout] Utilisateur connecté détecté', { userId });
      fetchUserData(userId.toString());
    } else if (guestId) {
      console.log('[Checkout] Mode invité détecté', { guestId });
      loadGuestData();
    } else {
      console.error('[Checkout] Aucun userId ou guestId trouvé');
      setError('Erreur : utilisateur non identifié');
    }
    setLoading(false);
  }, [session, status, isGuest]);

  const handleGuestCheckout = () => {
    console.log('[Checkout] Tentative de checkout invité:', { guestEmail });
    setError(null);

    if (!guestEmail) {
      console.error('[Checkout] E-mail vide');
      setError('Veuillez entrer un e-mail pour continuer en tant qu’invité');
      return;
    }
    if (!guestEmail.includes('@') || !guestEmail.includes('.')) {
      console.error('[Checkout] E-mail invalide:', guestEmail);
      setError('Veuillez entrer un e-mail valide');
      return;
    }

    const guestId = nanoid(8);
    localStorage.setItem('guestCheckout', 'true');
    localStorage.setItem('guestUserId', guestId);
    localStorage.setItem('guestEmail', guestEmail);
    localStorage.setItem('guestAddresses', JSON.stringify([]));
    localStorage.setItem('guestPaymentInfos', JSON.stringify([]));
    console.log('[Checkout] Invité initialisé:', { guestId, guestEmail });

    setIsGuest(true);
    loadGuestData();
  };

  const handleSaveNewAddress = async () => {
    console.log('[Checkout] Sauvegarde nouvelle adresse:', newAddress);
    if (
      !newAddress.first_name ||
      !newAddress.last_name ||
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
          setSelectedAddress(savedAddress.id_address);
          console.log('[Checkout] Adresse enregistrée et sélectionnée:', savedAddress.id_address);
        } else {
          const errorData = await response.text();
          console.error('[Checkout] Erreur sauvegarde adresse:', errorData);
          setError(`Erreur lors de l'ajout de l'adresse: ${errorData}`);
        }
      } catch (err) {
        console.error('[Checkout] Erreur réseau:', err);
        setError('Erreur réseau');
      }
    } else {
      const currentAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
      currentAddresses.push(newAddressData);
      localStorage.setItem('guestAddresses', JSON.stringify(currentAddresses));
      setAddresses(currentAddresses);
      setSelectedAddress(addressId);
      console.log('[Checkout] Adresse enregistrée et sélectionnée (invité):', addressId);
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
    console.log('[Checkout] Sauvegarde nouveau moyen de paiement:', {
      card_name: newPayment.card_name,
      userId: session?.user?.id_user,
    });
    if (!stripe || !elements) {
      console.error('[Checkout] Stripe non chargé:', { stripe, elements });
      setError('Stripe non chargé');
      return;
    }

    if (!newPayment.card_name) {
      console.error('[Checkout] Nom de carte manquant');
      setError('Veuillez entrer un nom pour la carte');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error('[Checkout] CardElement non trouvé');
      setError('Erreur avec le formulaire de paiement');
      return;
    }

    try {
      let attempts = 0;
      const maxAttempts = 3;
      let paymentMethod = null;

      while (attempts < maxAttempts) {
        try {
          console.log('[Checkout] Création du PaymentMethod, tentative:', attempts + 1);
          const result = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
            billing_details: { name: newPayment.card_name },
          });

          if (result.error) {
            throw new Error(result.error.message || 'Erreur lors de l’ajout du moyen de paiement');
          }

          paymentMethod = result.paymentMethod;
          console.log('[Checkout] PaymentMethod créé:', {
            id: paymentMethod.id,
            last4: paymentMethod.card?.last4,
            brand: paymentMethod.card?.brand,
          });
          break;
        } catch (err) {
          attempts++;
          console.warn(`[Checkout] Tentative ${attempts} échouée:`, err);
          if (attempts === maxAttempts) {
            throw new Error('Échec de la création du moyen de paiement après plusieurs tentatives');
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!paymentMethod?.id || !paymentMethod?.card?.last4 || !paymentMethod?.card?.brand) {
        console.error('[Checkout] Données Stripe incomplètes:', paymentMethod);
        setError('Données de paiement Stripe incomplètes');
        return;
      }

      if (!paymentMethod.id.startsWith('pm_')) {
        console.error('[Checkout] ID de PaymentMethod invalide:', paymentMethod.id);
        setError('Identifiant de paiement Stripe invalide');
        return;
      }

      const paymentId = nanoid(8);
      const newPaymentData: PaymentInfo = {
        id_payment_info: paymentId,
        card_name: newPayment.card_name,
        last_card_digits: paymentMethod.card.last4,
        stripe_payment_id: paymentMethod.id,
      };

      if (session?.user?.id_user) {
        console.log('[Checkout] Envoi à /api/users/payment-infos:', {
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
          console.log('[Checkout] Moyen de paiement enregistré:', savedPayment);
          setPaymentInfos([...paymentInfos, savedPayment]);
          setSelectedPayment(savedPayment.id_payment_info);
          console.log('[Checkout] Paiement sélectionné:', savedPayment.id_payment_info);
        } else {
          const errorData = await response.text();
          console.error('[Checkout] Erreur API:', errorData);
          setError(`Erreur lors de l'ajout du moyen de paiement: ${errorData}`);
          return;
        }
      } else {
        const currentPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');
        console.log('[Checkout] Données à enregistrer:', newPaymentData);
        currentPayments.push(newPaymentData);
        localStorage.setItem('guestPaymentInfos', JSON.stringify(currentPayments));
        setPaymentInfos(currentPayments);
        setSelectedPayment(paymentId);
        console.log('[Checkout] Paiement enregistré et sélectionné (invité):', {
          paymentId,
          stripe_payment_id: paymentMethod.id,
        });
      }

      setNewPayment({ card_name: '' });
      cardElement.clear();
    } catch (err) {
      console.error('[Checkout] Erreur lors de l’ajout du moyen de paiement:', err);
      setError('Erreur lors de l’ajout du moyen de paiement. Vérifiez votre connexion et réessayez.');
    }
  };

  const handleProceedToConfirmation = () => {
    console.log('[Checkout] Passage à la confirmation:', { selectedAddress, selectedPayment });
    if (!selectedAddress || !selectedPayment) {
      setError('Veuillez sélectionner une adresse et un moyen de paiement');
      return;
    }

    if (!session) {
      const guestAddresses = JSON.parse(localStorage.getItem('guestAddresses') || '[]');
      const guestPayments = JSON.parse(localStorage.getItem('guestPaymentInfos') || '[]');
      const addressExists = guestAddresses.some((addr: Address) => addr.id_address === selectedAddress);
      const paymentExists = guestPayments.find((pay: PaymentInfo) => pay.id_payment_info === selectedPayment);

      if (!addressExists) {
        setError('Adresse sélectionnée non valide');
        console.error('[Checkout] Adresse non trouvée:', { selectedAddress, guestAddresses });
        return;
      }

      if (!paymentExists) {
        setError('Moyen de paiement sélectionné non valide');
        console.error('[Checkout] Paiement non trouvé:', { selectedPayment, guestPayments });
        return;
      }

      if (!paymentExists.stripe_payment_id || !paymentExists.stripe_payment_id.startsWith('pm_')) {
        setError('Le moyen de paiement sélectionné contient un identifiant Stripe invalide');
        console.error('[Checkout] stripe_payment_id invalide:', {
          selectedPayment,
          stripe_payment_id: paymentExists.stripe_payment_id,
        });
        return;
      }
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
                  <p>Abonnement : {item.subscription || 'MONTHLY'}</p>
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
                    <SelectItem key={address.id_address} value={address.id_address}>
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
                    <SelectItem key={payment.id_payment_info} value={payment.id_payment_info}>
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