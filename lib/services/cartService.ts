import { PrismaClient, SubscriptionType, Session } from "@prisma/client";

const prisma = new PrismaClient();

// Définir une interface pour typer les méthodes de cartService
interface CartService {
  [x: string]: any;
  clearCart: (id_session: number) => Promise<void>; // Typage de clearCart
  getSessionByToken: (sessionToken: string) => Promise<Session | null>;
  getCartItems: (sessionId: number) => Promise<any>;
  addToCart: (
    sessionId: number,
    id_product: number,
    quantity: number,
    subscriptionType: SubscriptionType
  ) => Promise<any>;
  updateCartItem: (
    cartItemId: number,
    quantity: number,
    subscriptionType: SubscriptionType
  ) => Promise<any>;
  removeFromCart: (cartItemId: number) => Promise<void>;
}

const cartService: CartService = {
  // Vider le panier pour une session donnée
  async clearCart(id_session: number) {
    try {
      const cartItems = await prisma.cartItem.findMany({
        where: {
          sessionId_session: id_session,
        },
      });

      if (cartItems.length === 0) {
        return; // Rien à supprimer si le panier est déjà vide
      }

      await prisma.cartItem.deleteMany({
        where: {
          sessionId_session: id_session,
        },
      });
    } catch (error) {
      throw new Error("Erreur lors de la suppression du panier");
    }
  },

  // Récupérer une session par son token
  async getSessionByToken(sessionToken: string) {
    return await prisma.session.findUnique({
      where: { session_token: sessionToken },
    });
  },

  // Récupérer les éléments du panier pour une session donnée
  async getCartItems(sessionId: number) {
    return await prisma.cartItem.findMany({
      where: {
        sessionId_session: sessionId,
      },
      include: {
        product: true, // Inclure les détails du produit
      },
    });
  },

  // Ajouter un élément au panier
  async addToCart(
    sessionId: number,
    id_product: number,
    quantity: number,
    subscriptionType: SubscriptionType
  ) {
    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id_product },
    });

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    // Vérifier si un élément avec le même produit et type d'abonnement existe déjà
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        id_product,
        subscription_type: subscriptionType,
        sessionId_session: sessionId,
      },
    });

    if (existingCartItem) {
      // Si l'élément existe, mettre à jour la quantité
      return await prisma.cartItem.update({
        where: { id_cart_item: existingCartItem.id_cart_item },
        data: { quantity: existingCartItem.quantity + quantity },
      });
    } else {
      // Sinon, créer un nouvel élément
      return await prisma.cartItem.create({
        data: {
          id_product,
          quantity,
          subscription_type: subscriptionType,
          sessionId_session: sessionId,
        },
      });
    }
  },

  // Mettre à jour un élément du panier
  async updateCartItem(
    cartItemId: number,
    quantity: number,
    subscriptionType: SubscriptionType
  ) {
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
      },
    });
  },

  // Supprimer un élément du panier
  async removeFromCart(cartItemId: number) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id_cart_item: cartItemId },
    });

    if (!cartItem) {
      throw new Error("Élément du panier non trouvé");
    }

    await prisma.cartItem.delete({
      where: { id_cart_item: cartItemId },
    });
  },
};

export default cartService;