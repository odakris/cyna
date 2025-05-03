"use client"

import React from "react"
import { CartItem } from "@/context/CartContext"
import CartItemCard from "@/components/Cart/CartItemCard"
import EmptyCart from "@/components/Cart/EmptyCart"
import { useClientFetch } from "@/hooks/use-client-fetch"

interface CartListProps {
  items: CartItem[]
}

const CartList: React.FC<CartListProps> = ({ items }) => {
  // Hook personnalisé pour éviter les problèmes d'hydratation
  const { isMounted } = useClientFetch()

  if (!isMounted) {
    // Placeholder skeleton pour éviter l'erreur d'hydratation
    return (
      <div className="space-y-6">
        {[1, 2].map(i => (
          <div
            key={i}
            className="h-[257px] w-full bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (!items.length) {
    return <EmptyCart />
  }

  return (
    <div className="space-y-6">
      {items
        .filter(item => item && typeof item.uniqueId === "string")
        .map(item => (
          <CartItemCard key={item.uniqueId} item={item} />
        ))}
    </div>
  )
}

export default CartList
