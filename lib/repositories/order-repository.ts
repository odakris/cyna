import { prisma } from "@/lib/prisma"
import { OrderFormValues } from "@/lib/validations/order-schema"
import { Order } from "@prisma/client"

/**
 * Récupère la liste complète des commandes avec leurs produits associées.
 * @returns {Promise<Order[]>} Liste des commandes triés par ordre de priorité.
 */
export const findAll = async (): Promise<Order[]> => {
  return prisma.order.findMany({
    include: {
      user: true,
      order_items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

/**
 * Récupère une commande par son ID.
 * @param {number} id - ID de la commande à récupérer.
 * @returns {Promise<Order | null>} La commande correspondante ou null si non trouvée.
 */
export const findById = async (id: number): Promise<Order | null> => {
  return prisma.order.findUnique({
    where: { id_order: id },
    include: {
      user: true,
      order_items: {
        include: {
          product: true,
        },
      },
    },
  })
}

/**
 * Crée une nouvelle commande dans la base de données.
 * @param {OrderFormValues} data - Données de la commande à créer.
 * @returns {Promise<Order>} La commande nouvellement créée.
 */
export const create = async (data: OrderFormValues): Promise<Order> => {
  try {
    // Vérifier si l'utilisateur existe avant de créer la commande
    const userExists = await prisma.user.findUnique({
      where: { id_user: data.id_user },
    })
    if (!userExists) {
      throw new Error("L'utilisateur n'existe pas")
    }

    // // Vérifier si l'adresse existe avant de créer la commande
    // const addressExists = await prisma.address.findUnique({
    //   where: { id_address: data.id_address },
    // })
    // if (!addressExists) {
    //   throw new Error("L'adresse n'existe pas")
    // }

    // Vérifier si les articles de commande existent avant de créer la commande
    const orderItemsExist = await Promise.all(
      data.order_items.map(async item => {
        const productExists = await prisma.product.findUnique({
          where: { id_product: item.id_product },
        })
        return !!productExists
      })
    )
    if (orderItemsExist.includes(false)) {
      throw new Error("Un ou plusieurs articles de commande n'existent pas")
    }

    // Créer la commande
    return await prisma.order.create({
      data: {
        order_date: data.order_date,
        total_amount: data.total_amount,
        subtotal: data.subtotal,
        order_status: data.order_status,
        payment_method: data.payment_method.trim(),
        last_card_digits: data.last_card_digits?.trim(),
        invoice_number: data.invoice_number.trim(),
        invoice_pdf_url: data.invoice_pdf_url?.trim(),
        id_user: data.id_user,
        id_address: data.id_address,
      },
    })
  } catch (error) {
    console.error("Error creating order:", error)
    throw new Error("Failed to create order")
  }
}

/**
 * Met à jour une commande existante dans la base de données.
 * @param {number} id - ID de la commande à mettre à jour.
 * @param {OrderFormValues} data - Nouvelles données de la commande.
 * @returns {Promise<Order>} La commande mise à jour.
 */
export const update = async (
  id: number,
  data: OrderFormValues
): Promise<Order> => {
  try {
    // Vérifier si la commande existe avant de la mettre à jour
    const existingOrder = await prisma.order.findUnique({
      where: { id_order: id },
    })
    if (!existingOrder) {
      throw new Error(`Commande avec l'ID ${id} non trouvée`)
    }

    // Mettre à jour la commande
    return await prisma.order.update({
      where: { id_order: id },
      data: {
        order_date: data.order_date,
        total_amount: data.total_amount,
        subtotal: data.subtotal,
        order_status: data.order_status,
        payment_method: data.payment_method.trim(),
        last_card_digits: data.last_card_digits?.trim(),
        invoice_number: data.invoice_number.trim(),
        invoice_pdf_url: data.invoice_pdf_url?.trim(),
        id_user: data.id_user,
        id_address: data.id_address,
      },
    })
  } catch (error) {
    console.error("Error updating order:", error)
    throw new Error("Failed to update order")
  }
}

/**
 * Supprime une commande de la base de données.
 * @param {number} id - ID de la commande à supprimer.
 * @returns {Promise<Order>} La commande supprimée.
 */
export const remove = async (id: number): Promise<Order> => {
  try {
    // Vérifier si la commande existe avant de la supprimer
    const existingOrder = await prisma.order.findUnique({
      where: { id_order: id },
    })
    if (!existingOrder) {
      throw new Error(`Commande avec l'ID ${id} non trouvée`)
    }

    // Supprimer la commande
    return await prisma.order.delete({
      where: { id_order: id },
    })
  } catch (error) {
    console.error("Error deleting order:", error)
    throw new Error("Failed to delete order")
  }
}

/**
 * Vérifie si une commande existe dans la base de données.
 * @param {number} id - ID de la commande à vérifier.
 * @returns {Promise<boolean>} true si la commande existe, false sinon.
 */
export const exists = async (id: number): Promise<boolean> => {
  const count = await prisma.order.count({
    where: { id_order: id },
  })
  return count > 0
}

/**
 * Dépôt de données (repository) pour la gestion des commandes.
 */
const orderRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
  exists,
}

export default orderRepository
