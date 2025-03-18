"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"

// Définition du type d'un produit dans le panier
interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  subscription?: string
  imageUrl?: string
}

// Définition du type du contexte
interface CartContextType {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  addToCart: (product: CartItem) => void
}

// Création du contexte avec un type initial `null | CartContextType`
const CartContext = createContext<CartContextType | null>(null)

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])

  // Charger le panier depuis localStorage au chargement
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  // Fonction pour ajouter un produit au panier
  const addToCart = (product: CartItem) => {
    // console.log("Produit ajouté au panier : ", product);
    setCart(prevCart => [...prevCart, product])
  }

  return (
    <CartContext.Provider value={{ cart, setCart, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook pour utiliser le contexte du panier
export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
