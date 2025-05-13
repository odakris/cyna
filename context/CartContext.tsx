"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react"

export interface CartItem {
  id: string
  uniqueId: string
  name: string
  price: number
  quantity: number
  subscription?: string
  imageUrl?: string
}

interface CartContextType {
  cart: CartItem[]
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>
  addToCart: (product: CartItem) => void
  decreaseQuantity: (uniqueId: string) => void
  removeFromCart: (uniqueId: string) => void
  updateCartItem: (uniqueId: string, updates: Partial<CartItem>) => void
}

const CartContext = createContext<CartContextType | null>(null)

interface CartProviderProps {
  children: ReactNode
}

const generateUniqueId = (id: string, subscription?: string): string => {
  return `${id}-${subscription || "default"}-${Date.now()}`
}

// Charger le panier initial depuis localStorage (sûr pour SSR)
const getInitialCart = (): CartItem[] => {
  // Vérifier si nous sommes côté client
  if (typeof window === "undefined") {
    return []
  }
  try {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      if (Array.isArray(parsedCart)) {
        return parsedCart
          .filter(item => item && item.id && item.uniqueId)
          .map((item: CartItem) => {
            const subscription = item.subscription || "MONTHLY"
            return {
              ...item,
              uniqueId:
                item.uniqueId || generateUniqueId(item.id, subscription),
              subscription,
            }
          })
      }
    }
    return []
  } catch (error) {
    // console.error("Erreur lors du chargement initial de localStorage:", error)
    return []
  }
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart())
  const [isAdding, setIsAdding] = useState(false)

  // Log du chargement initial
  useEffect(() => {
    // console.log("Cart initial chargé:", cart);
  }, [])

  // Sauvegarder le panier dans localStorage à chaque modification (côté client uniquement)
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      localStorage.setItem("cart", JSON.stringify(cart))
      //   console.log("Panier sauvegardé dans localStorage:", cart);
    } catch (error) {
      // console.error("Erreur lors de la sauvegarde dans localStorage:", error)
    }
  }, [cart])

  const addToCart = (product: CartItem) => {
    if (isAdding) {
      console.log("Ajout en cours, appel ignoré pour éviter un double ajout")
      return
    }
    if (!product || !product.id || !product.name || !product.price) {
      // console.error("Produit invalide passé à addToCart:", product)
      return
    }
    setIsAdding(true)

    console.log("Produit reçu dans addToCart:", product)
    setCart(prevCart => {
      const subscription = product.subscription || "MONTHLY"
      const uniqueId =
        product.uniqueId || generateUniqueId(product.id, subscription)
      const productWithUniqueId = {
        ...product,
        uniqueId,
        subscription,
        quantity: product.quantity || 1,
      }

      const existingItem = prevCart.find(item => item.uniqueId === uniqueId)
      if (existingItem) {
        const updatedCart = prevCart.map(item =>
          item.uniqueId === uniqueId
            ? {
                ...item,
                quantity: item.quantity + productWithUniqueId.quantity,
              }
            : item
        )
        console.log("Produit existant, quantité mise à jour:", updatedCart)
        setIsAdding(false)
        return updatedCart
      }

      const updatedCart = [...prevCart, productWithUniqueId]
      console.log("Nouveau produit ajouté:", updatedCart)
      setIsAdding(false)
      return updatedCart
    })
  }

  const decreaseQuantity = (uniqueId: string) => {
    setCart(prevCart => {
      const item = prevCart.find(item => item.uniqueId === uniqueId)
      if (!item) {
        console.log(`Élément avec uniqueId ${uniqueId} non trouvé`)
        return prevCart
      }

      if (item.quantity <= 1) {
        const updatedCart = prevCart.filter(item => item.uniqueId !== uniqueId)
        console.log("Quantité <= 1, élément supprimé:", updatedCart)
        return updatedCart
      }

      const updatedCart = prevCart.map(item =>
        item.uniqueId === uniqueId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      console.log("Quantité diminuée:", updatedCart)
      return updatedCart
    })
  }

  const removeFromCart = (uniqueId: string) => {
    console.log("Suppression de l’élément avec uniqueId:", uniqueId)
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.uniqueId !== uniqueId)
      console.log("Nouveau panier après suppression:", updatedCart)
      return updatedCart
    })
  }

  const updateCartItem = (uniqueId: string, updates: Partial<CartItem>) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.uniqueId === uniqueId ? { ...item, ...updates } : item
      )
      console.log("Élément mis à jour:", updatedCart)
      return updatedCart
    })
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        updateCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = (): CartContextType => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
