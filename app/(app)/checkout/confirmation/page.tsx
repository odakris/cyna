"use client";

import { useState, useEffect, Dispatch, SetStateAction } from 'react';

// Définir les types basés sur le schéma Prisma
interface Address {
  id_address: number;
  address1: string;
  address2?: string | null;
  postal_code: string;
  city: string;
  region: string;
  country: string;
  mobile_phone: string;
  is_default_billing: boolean;
  is_default_shipping: boolean;
  id_user: number;
}

interface PaymentInfo {
  id_payment_info: number;
  card_name: string;
  brand: string;
  last_card_digits: string;
  stripe_payment_id: string;
  is_default: boolean;
  id_user: number;
}

interface Product {
  id_product: number;
  name: string;
}

interface CartItem {
  id_cart_item: number;
  quantity: number;
  subscription_type: string;
  id_product: number;
  userId_user: number;
  product: Product;
}

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentInfo[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function fetchUserData(
    setAddresses: Dispatch<SetStateAction<Address[]>>,
    setPaymentMethods: Dispatch<SetStateAction<PaymentInfo[]>>,
    setCart: Dispatch<SetStateAction<CartItem[]>>,
    setError: Dispatch<SetStateAction<string | null>>
  ): Promise<void> {
    try {
      // Récupération du panier
      // eslint-disable-next-line no-console
      console.log('[CheckoutPage] Envoi de la requête vers /api/cart');
      const cartResponse = await fetch('/api/cart', {
        method: 'GET',
        credentials: 'include',
      });
      // eslint-disable-next-line no-console
      console.log('[CheckoutPage] Statut de la réponse:', cartResponse.status);
      if (cartResponse.ok) {
        const cartItems: CartItem[] = await cartResponse.json();
        // eslint-disable-next-line no-console
        console.log('[CheckoutPage] Panier récupéré:', cartItems);
        setCart(cartItems);
      } else {
        const cartError = await cartResponse.json();
        // eslint-disable-next-line no-console
        console.error('[CheckoutPage] Erreur panier:', cartError);
        setError(cartError.message || 'Erreur lors du chargement du panier');
      }

      // Récupération des adresses
      const addressResponse = await fetch('/api/addresses', {
        method: 'GET',
        credentials: 'include',
      });
      if (addressResponse.ok) {
        const addresses: Address[] = await addressResponse.json();
        setAddresses(addresses);
      } else {
        const addressError = await addressResponse.json();
        // eslint-disable-next-line no-console
        console.error('[CheckoutPage] Erreur adresses:', addressError);
        setError(addressError.message || 'Erreur lors du chargement des adresses');
      }

      // Récupération des moyens de paiement
      const paymentResponse = await fetch('/api/payment-methods', {
        method: 'GET',
        credentials: 'include',
      });
      if (paymentResponse.ok) {
        const paymentMethods: PaymentInfo[] = await paymentResponse.json();
        setPaymentMethods(paymentMethods);
      } else {
        const paymentError = await paymentResponse.json();
        // eslint-disable-next-line no-console
        console.error('[CheckoutPage] Erreur moyens de paiement:', paymentError);
        setError(paymentError.message || 'Erreur lors du chargement des moyens de paiement');
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('[CheckoutPage] Erreur inattendue:', err);
      setError(err.message || 'Une erreur inattendue est survenue');
    }
  }

  useEffect(() => {
    fetchUserData(setAddresses, setPaymentMethods, setCart, setError);
  }, []);

  // Gérer le cas du panier vide
  if (cart.length === 0) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Checkout</h1>
        <p className="text-red-500">Votre panier est vide. Veuillez ajouter des articles avant de procéder au paiement.</p>
        <a href="/panier" className="text-blue-500 underline">Retourner au panier</a>
      </div>
    );
  }

  return (
    <div className="p-4">
      {error && <p className="text-red-500">{error}</p>}
      <h1 className="text-2xl font-bold">Checkout</h1>
      <h2>Adresses</h2>
      <ul>
        {addresses.map((addr) => (
          <li key={addr.id_address}>{addr.address1}, {addr.city}</li>
        ))}
      </ul>
      <h2>Moyens de paiement</h2>
      <ul>
        {paymentMethods.map((pm) => (
          <li key={pm.id_payment_info}>{pm.card_name} - {pm.brand} ****{pm.last_card_digits}</li>
        ))}
      </ul>
      <h2>Panier</h2>
      <ul>
        {cart.map((item) => (
          <li key={item.id_cart_item}>
            {item.product.name} - Quantité: {item.quantity}
          </li>
        ))}
      </ul>
    </div>
  );
}