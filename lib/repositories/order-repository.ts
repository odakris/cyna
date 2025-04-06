import { prisma } from "@/lib/prisma"
import { OrderFormValues } from "@/lib/validations/order-schema"
import { Order } from "@prisma/client"
import { TransactionClient } from "@/types/Types"

/**
 * Récupère la liste complète des commandes avec leurs produits associés.
 * @returns {Promise<Order[]>} Liste des commandes triées par date de commande décroissante.
 * @throws {Error} En cas d'erreur lors de la récupération des commandes.
 */
export const findAll = async (): Promise<Order[]> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        order_date: "desc",
      },
    })

    return orders || [] // Assurez-vous de toujours retourner un tableau, même vide
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error)

    // Créer une erreur avec un message plus descriptif
    const errorMessage =
      error instanceof Error
        ? `Échec de la récupération des commandes: ${error.message}`
        : "Échec de la récupération des commandes"

    throw new Error(errorMessage)
  }
}

/**
 * Récupère une commande par son ID avec tous ses détails.
 * @param {number} id - ID de la commande à récupérer.
 * @returns {Promise<Order | null>} La commande correspondante ou null si non trouvée.
 * @throws {Error} En cas d'erreur lors de la récupération de la commande.
 */
export const findById = async (id: number): Promise<Order | null> => {
  if (!id || id <= 0) {
    throw new Error("ID de commande invalide")
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id_order: id },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    })

    return order
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la commande ID ${id}:`,
      error
    )

    // Vérifier si l'erreur concerne un problème de clé étrangère ou autre erreur spécifique
    const errorMessage =
      error instanceof Error
        ? `Échec de la récupération de la commande ${id}: ${error.message}`
        : `Échec de la récupération de la commande ${id}`

    throw new Error(errorMessage)
  }
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

    // Vérifier si l'adresse existe avant de créer la commande
    const addressExists = await prisma.address.findUnique({
      where: { id_address: data.id_address },
    })
    if (!addressExists) {
      throw new Error("L'adresse n'existe pas")
    }

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

    // Utiliser une transaction pour créer l'ordre et ses éléments
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Créer l'ordre
      const newOrder = await tx.order.create({
        data: {
          order_date: data.order_date,
          total_amount: data.total_amount,
          subtotal: data.subtotal,
          order_status: data.order_status,
          payment_method: data.payment_method.trim(),
          last_card_digits: data.last_card_digits?.trim(),
          invoice_number: data.invoice_number,
          invoice_pdf_url: data.invoice_pdf_url?.trim(),
          id_user: data.id_user,
          id_address: data.id_address,
        },
      })

      // Créer les éléments de commande associés
      await Promise.all(
        data.order_items.map(item =>
          tx.orderItem.create({
            data: {
              subscription_type: item.subscription_type,
              subscription_status: item.subscription_status,
              subscription_duration: item.subscription_duration,
              renewal_date: item.renewal_date,
              quantity: item.quantity,
              unit_price: item.unit_price,
              id_product: item.id_product,
              id_order: newOrder.id_order,
            },
          })
        )
      )

      // Récupérer la commande complète avec les éléments
      return tx.order.findUnique({
        where: { id_order: newOrder.id_order },
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      })
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
      include: {
        order_items: true,
      },
    })
    if (!existingOrder) {
      throw new Error(`Commande avec l'ID ${id} non trouvée`)
    }

    // Utiliser une transaction pour mettre à jour l'ordre et ses éléments
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Mettre à jour l'ordre
      await tx.order.update({
        where: { id_order: id },
        data: {
          order_date: data.order_date,
          total_amount: data.total_amount,
          subtotal: data.subtotal,
          order_status: data.order_status,
          payment_method: data.payment_method.trim(),
          last_card_digits: data.last_card_digits?.trim(),
          invoice_number: data.invoice_number,
          invoice_pdf_url: data.invoice_pdf_url?.trim(),
          id_user: data.id_user,
          id_address: data.id_address,
        },
      })

      // Supprimer tous les anciens éléments de commande
      await tx.orderItem.deleteMany({
        where: { id_order: id },
      })

      // Créer les nouveaux éléments de commande
      await Promise.all(
        data.order_items.map(item =>
          tx.orderItem.create({
            data: {
              subscription_type: item.subscription_type,
              subscription_status: item.subscription_status,
              subscription_duration: item.subscription_duration,
              renewal_date: item.renewal_date,
              quantity: item.quantity,
              unit_price: item.unit_price,
              id_product: item.id_product,
              id_order: id,
            },
          })
        )
      )

      // Récupérer la commande mise à jour avec tous ses éléments
      return tx.order.findUnique({
        where: { id_order: id },
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
          user: true,
        },
      })
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
 * @throws {Error} Si la commande n'existe pas ou en cas d'erreur lors de la suppression.
 */
export const remove = async (id: number): Promise<Order> => {
  if (!id || id <= 0) {
    throw new Error("ID de commande invalide")
  }

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
      include: {
        // Vous pourriez vouloir inclure ces informations dans la réponse
        order_items: true,
        user: true,
      },
    })
  } catch (error) {
    // Distinguer entre les différents types d'erreurs
    if (error instanceof Error) {
      // Si c'est déjà notre erreur personnalisée pour "commande non trouvée"
      if (error.message.includes("non trouvée")) {
        throw error // Relance l'erreur originale
      }

      // Erreurs potentielles de clé étrangère ou de contrainte
      if (error.message.includes("foreign key constraint")) {
        console.error(
          `Impossible de supprimer la commande ID ${id} car elle est référencée ailleurs:`,
          error
        )
        throw new Error(
          `Impossible de supprimer la commande ID ${id} car elle est référencée par d'autres entités`
        )
      }

      // Autres erreurs techniques
      console.error(
        `Erreur lors de la suppression de la commande ID ${id}:`,
        error
      )
      throw new Error(
        `Échec de la suppression de la commande ${id}: ${error.message}`
      )
    }

    // Cas générique pour les erreurs non-Error
    console.error(
      `Erreur inconnue lors de la suppression de la commande ID ${id}:`,
      error
    )
    throw new Error(`Échec de la suppression de la commande ${id}`)
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
