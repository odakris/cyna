"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CartItem from "@/components/Cart/CartItem"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CartItemData {
  id_cart_item: number;
  quantity: number;
  subscription_type: string;
  product: {
    id_product: number;
    name: string;
    unit_price: number;
    discount_price: number | null;
    available_quantity: number; // Ajouté pour le stock disponible
    product_images?: { url: string }[];
  };
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du panier");
      }

      const data = await response.json();
      setCartItems(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la récupération du panier");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItem = async (
    id: string,
    quantity: number,
    subscription: string
  ) => {
    try {
      const response = await fetch("/api/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: parseInt(id, 10),
          quantity,
          subscriptionType: subscription,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour de l'élément");
      }

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id_cart_item.toString() === id
            ? { ...item, quantity, subscription_type: subscription }
            : item
        )
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour de l'élément");
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      const response = await fetch(`/api/cart/remove/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'élément");
      }

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id_cart_item.toString() !== id)
      );
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression de l'élément");
    }
  };

  // Calcul du prix total ajusté
  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      let adjustedPrice = item.product.unit_price;

      switch (item.subscription_type) {
        case "MONTHLY":
          adjustedPrice = item.product.unit_price;
          break;
        case "YEARLY":
          adjustedPrice = item.product.unit_price * 10; // Exemple : 10 mois payés
          break;
        case "PER_USER":
          adjustedPrice = item.product.unit_price * item.quantity;
          break;
        case "PER_MACHINE":
          adjustedPrice = item.product.unit_price * item.quantity;
          break;
        default:
          adjustedPrice = item.product.unit_price;
      }

      return total + adjustedPrice;
    }, 0);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totalPrice = calculateTotalPrice();

  if (loading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">{error}</p>;
  }

  if (!cartItems || cartItems.length === 0) {
    return <p className="text-center mt-10">Votre panier est vide.</p>;
  }

  return (
    <div className="py-8 px-6 container mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Votre panier</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <CartItem
            key={item.id_cart_item}
            id={item.id_cart_item.toString()}
            name={item.product.name}
            price={item.product.unit_price}
            quantity={item.quantity}
            subscription={item.subscription_type}
            imageUrl={item.product.product_images?.[0]?.url || ""}
            onUpdate={handleUpdateItem}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            <strong>Total : {totalPrice.toFixed(2)} €</strong>
          </p>
          <div className="mt-4 flex justify-end">
            <Button variant="default" size="lg">
              Passer à la caisse
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}