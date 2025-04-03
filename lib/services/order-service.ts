import orderRepository from "../repositories/order-repository"
import { OrderFormValues } from "../validations/order-schema"
import { Order } from "@prisma/client"

/**
 * Récupère la liste complète des commandes depuis le dépôt de données.
 * @returns {Promise<Order[]>} Liste des commandes.
 */
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    return await orderRepository.findAll()
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes :", error)
    throw new Error("Erreur lors de la récupération des commandes")
  }
}

/**
 * Récupère une commande spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la commande.
 * @returns {Promise<Order>} La commande correspondante.
 * @throws {Error} Si la commande n'existe pas.
 */
export const getOrderById = async (id: number): Promise<Order> => {
  try {
    const order = await orderRepository.findById(id)

    if (!order) {
      throw new Error("Commande non trouvée")
    }

    return order
  } catch (error) {
    console.error("Erreur lors de la récupération de la commande :", error)
    throw new Error("Erreur lors de la récupération de la commande")
  }
}

/**
 * Crée une nouvelle commande en base de données.
 * @param {OrderFormValues} data - Données de la commande à enregistrer.
 * @returns {Promise<Order>} La commande nouvellement créée.
 */
export const createOrder = async (data: OrderFormValues): Promise<Order> => {
  try {
    return await orderRepository.create(data)
  } catch (error) {
    console.error("Erreur lors de la création de la commande :", error)
    throw new Error("Erreur lors de la création de la commande")
  }
}

/**
 * Met à jour une commande existante avec de nouvelles informations.
 * @param {number} id - Identifiant de la commande à mettre à jour.
 * @param {OrderFormValues} data - Nouvelles données de la commande.
 * @returns {Promise<Order>} La commande mise à jour.
 * @throws {Error} Si la commande n'existe pas.
 */
export const updateOrder = async (
  id: number,
  data: OrderFormValues
): Promise<Order> => {
  try {
    const exists = await orderRepository.exists(id)

    if (!exists) {
      throw new Error("Commande non trouvée")
    }

    return await orderRepository.update(id, data)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande :", error)
    throw new Error("Erreur lors de la mise à jour de la commande")
  }
}

/**
 * Supprime une commande de la base de données.
 * @param {number} id - Identifiant de la commande à supprimer.
 * @returns {Promise<object>} Message de confirmation de suppression.
 * @throws {Error} Si la commande n'existe pas.
 */
export const deleteOrder = async (id: number): Promise<object> => {
  try {
    const exists = await orderRepository.exists(id)

    if (!exists) {
      throw new Error("Commande non trouvée")
    }

    await orderRepository.remove(id)
    return { success: true, message: "Commande supprimée avec succès" }
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande :", error)
    throw new Error("Erreur lors de la suppression de la commande")
  }
}

const orderService = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
}

export default orderService
