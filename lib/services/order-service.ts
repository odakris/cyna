import { z } from 'zod';
import { orderInputSchema } from '@/lib/validations/order-schema';

// Fonction pour créer une commande
const createOrder = async (data: z.infer<typeof orderInputSchema>) => {
  console.log('[OrderService] Création de la commande avec données:', JSON.stringify(data, null, 2));

  try {
    // Vérification des données
    if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
      throw new Error('cartItems doit être un tableau non vide');
    }
    if (!data.addressId || typeof data.addressId !== 'string') {
      throw new Error('addressId doit être une chaîne non vide');
    }
    if (!data.paymentId || typeof data.paymentId !== 'string') {
      throw new Error('paymentId doit être une chaîne non vide');
    }
    if (!data.paymentIntentId || typeof data.paymentIntentId !== 'string') {
      throw new Error('paymentIntentId doit être une chaîne non vide');
    }

    // Logique simulée pour créer une commande (remplacez par votre logique de base de données)
    const order = {
      id_order: `order_${Date.now()}`,
      cartItems: data.cartItems,
      addressId: data.addressId,
      paymentId: data.paymentId,
      paymentIntentId: data.paymentIntentId,
      id_user: data.id_user,
      guestId: data.guestId,
      total_amount: data.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      created_at: new Date().toISOString(),
    };

    console.log('[OrderService] Commande simulée:', JSON.stringify(order, null, 2));

    // Simuler une insertion en base de données (remplacez par votre logique réelle)
    // Exemple : await db.orders.insert(order);

    return order;
  } catch (error) {
    console.error('[OrderService] Erreur lors de la création de la commande:', error);
    throw error; // Propager l'erreur pour la gérer dans order-controller
  }
};

// Exporter l'objet avec la fonction create
export default {
  create: createOrder,
};