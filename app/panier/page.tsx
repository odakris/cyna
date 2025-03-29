"use client"

import { useCart } from "@/context/CartContext"
import CartItem from "@/components/Cart/CartItem"
import { useState, useEffect } from "react"

export default function PanierPage() {
    const { cart, setCart } = useCart();
    const [totalAmount, setTotalAmount] = useState(0);
  
    useEffect(() => {
      const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setTotalAmount(total);
    }, [cart]);
  
    const handleUpdateItem = (
      id: string,
      quantity: number,
      subscription: string
    ) => {
      setCart(
        cart.map(item =>
          item.id === id && item.subscription === subscription
            ? { ...item, quantity }
            : item
        )
      );
    };
  
    const handleRemoveItem = (id: string) => {
      setCart(cart.filter(item => item.id !== id));
    };
  
    return (
      <main className="p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Votre Panier</h1>
  
        <h2 className="text-xl font-semibold mb-4">Liste des services ajoutés :</h2>
  
        {cart.length === 0 ? (
          <p className="text-center text-gray-500">Votre panier est vide.</p>
        ) : (
          cart.map(item => (
            <CartItem
              key={item.id + item.subscription} // Assurez-vous que chaque item est unique
              id={item.id}
              name={item.name}
              price={item.price}
              quantity={item.quantity}
              subscription={item.subscription ?? ""}
              imageUrl={item.imageUrl ?? ""}
              onUpdate={handleUpdateItem}
              onRemove={handleRemoveItem}
            />
          ))
        )}
  
        {/* Montant total */}
        <div className="mt-6 p-4 border-t text-xl font-bold flex justify-between">
          <span>Montant total à payer :</span>
          <span>{totalAmount.toFixed(2)}€</span>
        </div>
      </main>
    );
  }
  