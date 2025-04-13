"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentInfos, setPaymentInfos] = useState<PaymentInfo[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    address1: "",
    address2: "",
    postal_code: "",
    city: "",
    country: "",
  });
  const [newPayment, setNewPayment] = useState({
    card_name: "",
    card_number: "",
    expiration_month: "",
    expiration_year: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    const response = await fetch("/api/cart");
    if (response.ok) {
      const data = await response.json();
      setCartItems(data);
    }
  };

  const fetchUserData = async () => {
    if (session) {
      const [addressResponse, paymentResponse] = await Promise.all([
        fetch("/api/user/addresses"),
        fetch("/api/user/payment-infos"),
      ]);

      if (addressResponse.ok) {
        setAddresses(await addressResponse.json());
      }
      if (paymentResponse.ok) {
        setPaymentInfos(await paymentResponse.json());
      }
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth?redirect=/checkout");
      return;
    }

    fetchCart();
    fetchUserData();
    setLoading(false);
  }, [session, status, router]);

  const handleProceedToConfirmation = () => {
    if (!selectedAddress || !selectedPayment) {
      setError("Veuillez sélectionner une adresse et un moyen de paiement");
      return;
    }

    router.push(`/checkout/confirmation?addressId=${selectedAddress}&paymentId=${selectedPayment}`);
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  const totalCartPrice = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Passer la commande</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Select onValueChange={(value) => setSelectedAddress(parseInt(value))}>
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
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Moyen de paiement</CardTitle>
              <CardDescription>Sélectionnez ou ajoutez un moyen de paiement</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={(value) => setSelectedPayment(parseInt(value))}>
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
                <Input
                  placeholder="Numéro de carte"
                  value={newPayment.card_number}
                  onChange={(e) => setNewPayment({ ...newPayment, card_number: e.target.value })}
                  className="mt-2"
                />
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="MM"
                    value={newPayment.expiration_month}
                    onChange={(e) => setNewPayment({ ...newPayment, expiration_month: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    placeholder="AA"
                    value={newPayment.expiration_year}
                    onChange={(e) => setNewPayment({ ...newPayment, expiration_year: e.target.value })}
                    className="w-20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <Button className="mt-4 w-full" onClick={handleProceedToConfirmation}>
        Continuer vers la confirmation
      </Button>
    </div>
  );
}