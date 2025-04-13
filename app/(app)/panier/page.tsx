"use client";

import { Button } from "@/components/ui/button";
import CartItem from "@/components/Cart/CartItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { useEffect } from "react";

export default function CartPage() {
  const { cart } = useCart();

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => {
      let unitPrice = item.price;
      switch (item.subscription || "MONTHLY") {
        case "MONTHLY":
          unitPrice = item.price;
          break;
        case "YEARLY":
          unitPrice = item.price * 12; // Prix annuel = mensuel * 12
          break;
        case "PER_USER":
          unitPrice = item.price;
          break;
        case "PER_MACHINE":
          unitPrice = item.price;
          break;
        default:
          unitPrice = item.price;
      }
      return total + unitPrice * item.quantity;
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  useEffect(() => {
    console.log("CartPage chargé - Contenu de cart:", cart);
    console.log("CartPage chargé - Contenu de localStorage.cart:", localStorage.getItem("cart"));
  }, [cart]);

  return (
    <div className="py-8 px-6 container mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Votre panier</h1>

      {cart.length === 0 ? (
        <p className="text-center mt-10">Votre panier est vide.</p>
      ) : (
        <div className="space-y-4">
          {cart
            .filter((item) => item && typeof item.uniqueId === "string")
            .map((item) => (
              <CartItem key={item.uniqueId} item={item} />
            ))}
        </div>
      )}
      {cart.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              <strong>Total : {totalPrice.toFixed(2)} €</strong>
            </p>
            <div className="mt-4 flex justify-end">
              <Button variant="default" size="lg">Passer à la caisse</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}