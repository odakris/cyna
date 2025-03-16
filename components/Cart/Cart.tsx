import React from "react"

interface CartProps {
  items: { id: number; name: string; price: number; quantity: number }[]
}

const Cart = ({ items }: CartProps) => {
  const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return (
    <div className="cart">
      <h2>Votre Panier</h2>
      {items.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <ul>
          {items.map(item => (
            <li key={item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span>{item.quantity} x {item.price} €</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <strong>Total: {totalPrice} €</strong>
      </div>
    </div>
  )
}

export default Cart
