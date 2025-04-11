import type { CartItem } from "@prisma/client"

export function upsertCartItem(cart: CartItem[], newItem: CartItem): CartItem[] {
  const found = cart.find(item => item.id_cart_item === newItem.id_cart_item)

  if (found) {
    // Remplace entièrement l’item pour ce service
    return cart.map(item =>
      item.id_cart_item === newItem.id_cart_item ? { ...item, ...newItem } : item
    )
  }

  return [...cart, newItem]
}
