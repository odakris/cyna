import { prisma } from "@/lib/prisma";
import { SubscriptionType, CartItem, Product } from "@prisma/client";

// Définir un type pour un CartItem avec son produit inclus
type CartItemWithProduct = CartItem & {
  product: {
    id_product: number;
    name: string;
    unit_price: number;
    discount_price: number | null;
  };
};

// Définir une interface pour typer les méthodes de cartRepository
interface CartRepository {
  getCartItemsBySession: (sessionId: number) => Promise<CartItemWithProduct[]>;
  addCartItem: (
    sessionId: number,
    productId: number,
    quantity: number,
    subscriptionType: SubscriptionType
  ) => Promise<CartItemWithProduct>;
  updateCartItem: (
    cartItemId: number,
    quantity: number,
    subscriptionType: SubscriptionType
  ) => Promise<CartItemWithProduct>;
  removeCartItem: (cartItemId: number) => Promise<void>;
  clearCart: (sessionId: number) => Promise<void>;
}

// Récupérer les éléments du panier pour une session donnée
export const getCartItemsBySession = async (sessionId: number): Promise<CartItemWithProduct[]> => {
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    throw new Error("L'ID de la session doit être un entier positif");
  }

  return await prisma.cartItem.findMany({
    where: { sessionId_session: sessionId },
    include: {
      product: {
        select: {
          id_product: true,
          name: true,
          unit_price: true,
          discount_price: true,
        },
      },
    },
  });
};

// Ajouter un élément au panier
export const addCartItem = async (
  sessionId: number,
  productId: number,
  quantity: number,
  subscriptionType: SubscriptionType
): Promise<CartItemWithProduct> => {
  // Validation des paramètres
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    throw new Error("L'ID de la session doit être un entier positif");
  }
  if (!Number.isInteger(productId) || productId <= 0) {
    throw new Error("L'ID du produit doit être un entier positif");
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("La quantité doit être un entier positif");
  }
  if (!Object.values(SubscriptionType).includes(subscriptionType)) {
    throw new Error("Type d'abonnement invalide");
  }

  // Vérifier si le produit existe
  const product = await prisma.product.findUnique({
    where: { id_product: productId },
  });
  if (!product) {
    throw new Error("Produit non trouvé");
  }

  // Vérifier si un élément avec le même produit, type d'abonnement et session existe déjà
  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      id_product: productId,
      subscription_type: subscriptionType,
      sessionId_session: sessionId,
    },
  });

  if (existingCartItem) {
    // Si l'élément existe, mettre à jour la quantité
    return await prisma.cartItem.update({
      where: { id_cart_item: existingCartItem.id_cart_item },
      data: {
        quantity: existingCartItem.quantity + quantity,
        updated_at: new Date(),
      },
      include: {
        product: {
          select: {
            id_product: true,
            name: true,
            unit_price: true,
            discount_price: true,
          },
        },
      },
    });
  } else {
    // Sinon, créer un nouvel élément
    return await prisma.cartItem.create({
      data: {
        sessionId_session: sessionId,
        id_product: productId,
        quantity,
        subscription_type: subscriptionType,
      },
      include: {
        product: {
          select: {
            id_product: true,
            name: true,
            unit_price: true,
            discount_price: true,
          },
        },
      },
    });
  }
};

// Mettre à jour un élément du panier
export const updateCartItem = async (
  cartItemId: number,
  quantity: number,
  subscriptionType: SubscriptionType
): Promise<CartItemWithProduct> => {
  // Validation des paramètres
  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    throw new Error("L'ID de l'élément du panier doit être un entier positif");
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("La quantité doit être un entier positif");
  }
  if (!Object.values(SubscriptionType).includes(subscriptionType)) {
    throw new Error("Type d'abonnement invalide");
  }

  // Vérifier si l'élément existe
  const cartItem = await prisma.cartItem.findUnique({
    where: { id_cart_item: cartItemId },
  });
  if (!cartItem) {
    throw new Error("Élément du panier non trouvé");
  }

  return await prisma.cartItem.update({
    where: { id_cart_item: cartItemId },
    data: {
      quantity,
      subscription_type: subscriptionType,
      updated_at: new Date(),
    },
    include: {
      product: {
        select: {
          id_product: true,
          name: true,
          unit_price: true,
          discount_price: true,
        },
      },
    },
  });
};

// Supprimer un élément du panier
export const removeCartItem = async (cartItemId: number): Promise<void> => {
  // Validation des paramètres
  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    throw new Error("L'ID de l'élément du panier doit être un entier positif");
  }

  // Vérifier si l'élément existe
  const cartItem = await prisma.cartItem.findUnique({
    where: { id_cart_item: cartItemId },
  });
  if (!cartItem) {
    throw new Error("Élément du panier non trouvé");
  }

  await prisma.cartItem.delete({
    where: { id_cart_item: cartItemId },
  });
};

// Vider le panier pour une session donnée
export const clearCart = async (sessionId: number): Promise<void> => {
  // Validation des paramètres
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    throw new Error("L'ID de la session doit être un entier positif");
  }

  await prisma.cartItem.deleteMany({
    where: { sessionId_session: sessionId },
  });
};

// Définir l'objet cartRepository avec un typage explicite
const cartRepository: CartRepository = {
  getCartItemsBySession,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
};

export default cartRepository;