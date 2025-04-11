"use client";

import { Button } from "@/components/ui/button";
import CartItem from "@/components/Cart/CartItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart } = useCart();

  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const totalPrice = calculateTotalPrice();

  console.log("Contenu de cart dans CartPage:", cart); // Log pour voir ce qui est vraiment dans cart

  return (
    <div className="py-8 px-6 container mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Votre panier</h1>

      {cart.length === 0 ? (
        <p className="text-center mt-10">Votre panier est vide.</p>
      ) : (
        <div className="space-y-4">
          {cart
            .filter((item) => item && typeof item.uniqueId === "string") // Filtrer les éléments valides
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