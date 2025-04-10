"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

// Définition du type d'un produit dans le panier
export interface CartItem {
  id: string;
  uniqueId: string; // Identifiant unique (id + subscription)
  name: string;
  price: number;
  quantity: number;
  subscription?: string;
  imageUrl?: string;
}

// Définition du type du contexte
interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: CartItem) => void;
  decreaseQuantity: (uniqueId: string) => void;
  removeFromCart: (uniqueId: string) => void;
  updateCartItem: (uniqueId: string, updates: Partial<CartItem>) => void;
}

// Création du contexte avec un type initial `null | CartContextType`
const CartContext = createContext<CartContextType | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

// Fonction pour générer un identifiant unique
const generateUniqueId = (id: string, subscription?: string): string => {
  return `${id}-${subscription || "default"}`;
};

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdding, setIsAdding] = useState(false); // État pour éviter les doubles appels

  // Charger le panier depuis localStorage au chargement
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      const updatedCart = parsedCart.map((item: CartItem) => {
        const subscription = item.subscription || "MONTHLY";
        return {
          ...item,
          uniqueId: item.uniqueId || generateUniqueId(item.id, subscription),
          subscription,
        };
      });
      setCart(updatedCart);
      console.log("Panier chargé depuis localStorage:", updatedCart);
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Panier sauvegardé dans localStorage:", cart);
  }, [cart]);

  // Fonction pour ajouter un produit au panier
  const addToCart = (product: CartItem) => {
    if (isAdding) {
      console.log("Ajout en cours, appel ignoré pour éviter un double ajout");
      return;
    }
    setIsAdding(true);

    console.log("Produit reçu dans addToCart:", product);
    setCart((prevCart) => {
      const subscription = product.subscription || "MONTHLY";
      if (!product.subscription) {
        console.warn("subscription manquant dans le produit, utilisation de MONTHLY par défaut:", product);
      }

      const uniqueId = generateUniqueId(product.id, subscription);
      const productWithUniqueId = {
        ...product,
        uniqueId,
        subscription,
      };

      const existingItem = prevCart.find((item) => item.uniqueId === uniqueId);
      if (existingItem) {
        const updatedCart = prevCart.map((item) =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
        console.log("Produit existant, quantité mise à jour:", updatedCart);
        setIsAdding(false);
        return updatedCart;
      }

      const updatedCart = [...prevCart, productWithUniqueId];
      console.log("Nouveau produit ajouté:", updatedCart);
      setIsAdding(false);
      return updatedCart;
    });
  };

  // Fonction pour diminuer la quantité d'un produit
  const decreaseQuantity = (uniqueId: string) => {
    setCart((prevCart) => {
      const item = prevCart.find((item) => item.uniqueId === uniqueId);
      if (!item) {
        console.log(`Élément avec uniqueId ${uniqueId} non trouvé`);
        return prevCart;
      }

      if (item.quantity <= 1) {
        const updatedCart = prevCart.filter((item) => item.uniqueId !== uniqueId);
        console.log("Quantité <= 1, élément supprimé:", updatedCart);
        return updatedCart;
      }

      const updatedCart = prevCart.map((item) =>
        item.uniqueId === uniqueId ? { ...item, quantity: item.quantity - 1 } : item
      );
      console.log("Quantité diminuée:", updatedCart);
      return updatedCart;
    });
  };

  // Fonction pour supprimer un produit du panier
  const removeFromCart = (uniqueId: string) => {
    console.log("Suppression de l'élément avec uniqueId:", uniqueId);
    setCart((prevCart) => {
      const updatedCart = prevCart.filter((item) => item.uniqueId !== uniqueId);
      console.log("Nouveau panier après suppression:", updatedCart);
      return updatedCart;
    });
  };

  // Fonction pour mettre à jour un produit dans le panier
  const updateCartItem = (uniqueId: string, updates: Partial<CartItem>) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((item) =>
        item.uniqueId === uniqueId ? { ...item, ...updates } : item
      );
      console.log("Élément mis à jour:", updatedCart);
      return updatedCart;
    });
  };

  return (
    <CartContext.Provider
      value={{ cart, setCart, addToCart, decreaseQuantity, removeFromCart, updateCartItem }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook pour utiliser le contexte du panier
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};