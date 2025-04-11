"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import CartItem from "@/components/Cart/CartItem"; // Utilisation de components/CartItem.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";

interface CartItemData {
  id_cart_item: number;
  quantity: number;
  subscription_type: string;
  product: {
    id_product: number;
    name: string;
    unit_price: number;
    discount_price: number | null;
    available_quantity: number;
    product_images?: { url: string }[];
  };
}

export default function CartPage() {

  const { addToCart, cart } = useCart();


  const calculateTotalPrice = () => {
    return cart.reduce((total, item) => {
      let adjustedPrice = item.price;
      switch (item.subscription) {
        case "MONTHLY":
          adjustedPrice = item.price * item.quantity;
          break;
        case "YEARLY":
          adjustedPrice = item.price * 12 * item.quantity; 
          break;
        case "PER_USER":
          adjustedPrice = item.price * item.quantity;
          break;
        case "PER_MACHINE":
          adjustedPrice = item.price * item.quantity;
          break;
        default:
          adjustedPrice = item.price;
      }
      return total + adjustedPrice;
    }, 0);
  };

  const totalPrice = calculateTotalPrice();

  return (
    <div className="py-8 px-6 container mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Votre panier</h1>
      


      {cart.length === 0 ? (
        <p className="text-center mt-10">Votre panier est vide.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <CartItem key={item.uniqueId}
              item={item}
            />
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