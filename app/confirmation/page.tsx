"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import emailjs from "@emailjs/browser";

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    unitPrice: number;
  };
  quantity: number;
  subscriptionType: string;
  totalPrice: number;
}

interface Address {
  id_address: number;
  address1: string;
  address2?: string;
  postal_code: string;
  city: string;
  country: string;
}

interface PaymentInfo {
  id_payment_info: number;
  card_name: string;
  last_card_digits: string;
}

export default function ConfirmationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const addressId = searchParams.get("addressId");
  const paymentId = searchParams.get("paymentId");

  const fetchData = async () => {
    try {
      const [cartResponse, addressResponse, paymentResponse] = await Promise.all([
        fetch("/api/cart"),
        fetch(`/api/addresses/${addressId}`),
        fetch(`/api/payment-infos/${paymentId}`),
      ]);

      if (cartResponse.ok) {
        setCartItems(await cartResponse.json());
      }
      if (addressResponse.ok) {
        setAddress(await addressResponse.json());
      }
      if (paymentResponse.ok) {
        setPaymentInfo(await paymentResponse.json());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth?redirect=/checkout/confirmation");
      return;
    }

    if (!addressId || !paymentId) {
      router.push("/checkout");
      return;
    }

    fetchData();
  }, [session, status, addressId, paymentId, router]);

  const handleConfirmPurchase = async () => {
    try {
      // Créer la commande
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          addressId: parseInt(addressId!),
          paymentId: parseInt(paymentId!),
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la commande");
      }

      const order = await response.json();

      // Envoyer un e-mail de confirmation
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ORDER_CONFIRMATION!,
        {
          to_email: session?.user?.email,
          order_id: order.id_order,
          total_amount: order.total_amount.toFixed(2),
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      // Vider le panier
      await fetch("/api/cart/clear", { method: "POST" });

      router.push("/order-confirmation?orderId=" + order.id_order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!address || !paymentInfo) {
    return <p>Données manquantes. Veuillez retourner au checkout.</p>;
  }

  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxes = totalCartPrice * 0.2; // Exemple : 20% de taxes
  const finalTotal = totalCartPrice + taxes;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Confirmation de la commande</h1>
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif de la commande</CardTitle>
        </CardHeader>
        <CardContent>
          {cartItems.map((item) => (
            <div key={item.id} className="mb-2">
              <p>{item.product.name}</p>
              <p>Quantité : {item.quantity}</p>
              <p>Abonnement : {item.subscriptionType}</p>
              <p>Total : {item.totalPrice.toFixed(2)} €</p>
            </div>
          ))}
          <p className="mt-4">Sous-total : {totalCartPrice.toFixed(2)} €</p>
          <p>Taxes (20%) : {taxes.toFixed(2)} €</p>
          <p className="text-xl font-bold">Total final : {finalTotal.toFixed(2)} €</p>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Adresse de facturation</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{address.address1}</p>
          {address.address2 && <p>{address.address2}</p>}
          <p>
            {address.postal_code} {address.city}, {address.country}
          </p>
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
      <Button className="mt-4 w-full" onClick={handleConfirmPurchase}>
        Confirmer l'achat
      </Button>
    </div>
  );
}