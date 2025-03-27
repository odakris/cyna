"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import CartItem from "./CartItem"; // Assurez-vous que le chemin est correct

interface CartItemData {
  id: string; // Changé en string pour correspondre à CartItemProps
  name: string;
  price: number;
  quantity: number;
  subscription: string; // Ajouté pour correspondre à CartItem
  imageUrl: string; // Ajouté pour correspondre à CartItem
}

interface CartProps {
  initialItems: CartItemData[];
}

const Cart: React.FC<CartProps> = ({ initialItems }) => {
  const [items, setItems] = useState<CartItemData[]>(initialItems);

  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleUpdateItem = (id: string, quantity: number, subscription: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity, subscription } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  return (
    <div className="cart container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Votre Panier</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Votre panier est vide.</p>
      ) : (
        <div>
          {items.map((item) => (
            <CartItem
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              subscription={item.subscription}
              imageUrl={item.imageUrl}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
            />
          ))}
          <div className="mt-6 flex justify-end">
            <div className="text-lg">
              <strong>Total : {totalPrice.toFixed(2)} €</strong>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="default" size="lg">
              Passer à la caisse
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;