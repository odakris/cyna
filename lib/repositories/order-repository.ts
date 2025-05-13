import { prisma } from "@/lib/prisma"
import { OrderFormValues } from "@/lib/validations/order-schema"
import { Order, OrderStatus } from "@prisma/client"
import { TransactionClient } from "@/types/Types"
import { Product } from "@prisma/client"

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
        address: true,
      },
      orderBy: {
        order_date: "desc",
      },
    })

    return orders || [] // Assurez-vous de toujours retourner un tableau, même vide
  } catch (error) {
    // console.error("Erreur lors de la récupération des commandes:", error)

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
            product: {
              include: {
                category: true,
                product_caroussel_images: true,
              },
            },
          },
        },
        user: {
          select: {
            id_user: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        address: true,
      },
    })

    return order
  } catch (error) {
    /*console.error(
      `Erreur lors de la récupération de la commande ID ${id}:`,
      error
    )*/

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

    // Vérifier si les produits existent et ont un stock suffisant
    const stocksCheck = await Promise.all(
      data.order_items.map(async item => {
        const product: Product = await prisma.product.findUnique({
          where: { id_product: item.id_product },
        })

        if (!product) {
          return {
            exists: false,
            hasStock: false,
            productId: item.id_product,
            name: "Produit inconnu",
          }
        }

        // Vérifier si le stock est suffisant
        const hasStock = product.stock >= item.quantity

        return {
          exists: true,
          hasStock,
          productId: item.id_product,
          name: product.name,
          requested: item.quantity,
          available: product.stock,
        }
      })
    )

    // Vérifier si des produits n'existent pas
    const nonExistentProducts = stocksCheck.filter(p => !p.exists)
    if (nonExistentProducts.length > 0) {
      throw new Error(
        `Les produits suivants n'existent pas: ${nonExistentProducts.map(p => p.productId).join(", ")}`
      )
    }

    // Vérifier si des produits n'ont pas de stock suffisant
    const insufficientStocks = stocksCheck.filter(p => !p.hasStock)
    if (insufficientStocks.length > 0) {
      const details = insufficientStocks
        .map(
          p => `${p.name} (demandé: ${p.requested}, disponible: ${p.available})`
        )
        .join(", ")
      throw new Error(`Stock insuffisant pour: ${details}`)
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
        data.order_items.map(async item => {
          // Créer l'élément de commande
          await tx.orderItem.create({
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

          // Décrémenter le stock du produit
          await tx.product.update({
            where: { id_product: item.id_product },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        })
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
    // console.error("Error creating order:", error)
    throw error instanceof Error ? error : new Error("Failed to create order")
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

    // Créer un map des éléments de commande existants pour faciliter l'accès
    const existingItemsMap = new Map<number, number>(
      existingOrder.order_items.map((item: Product) => [
        item.id_product,
        item.stock,
      ])
    )

    // Vérifier les stocks pour les nouveaux articles ou les articles mis à jour
    const stocksToCheck = await Promise.all(
      data.order_items.map(async item => {
        const product: Product = await prisma.product.findUnique({
          where: { id_product: item.id_product },
        })

        if (!product) {
          return {
            exists: false,
            hasStock: false,
            productId: item.id_product,
            name: "Produit inconnu",
          }
        }

        // Calcul du changement de quantité requis
        const existingQuantity = existingItemsMap.get(item.id_product) || 0
        const quantityChange = item.quantity - existingQuantity

        // Si la quantité diminue ou reste la même, pas besoin de vérifier le stock
        if (quantityChange <= 0) {
          return {
            exists: true,
            hasStock: true,
            productId: item.id_product,
            name: product.name,
          }
        }

        // Vérifier si le stock est suffisant pour l'augmentation de quantité
        const hasStock = product.stock >= quantityChange

        return {
          exists: true,
          hasStock,
          productId: item.id_product,
          name: product.name,
          requested: quantityChange,
          available: product.stock,
        }
      })
    )

    // Vérifier si des produits n'existent pas
    const nonExistentProducts = stocksToCheck.filter(p => !p.exists)
    if (nonExistentProducts.length > 0) {
      throw new Error(
        `Les produits suivants n'existent pas: ${nonExistentProducts.map(p => p.productId).join(", ")}`
      )
    }

    // Vérifier si des produits n'ont pas de stock suffisant
    const insufficientStocks = stocksToCheck.filter(p => !p.hasStock)
    if (insufficientStocks.length > 0) {
      const details = insufficientStocks
        .map(
          p => `${p.name} (ajout: ${p.requested}, disponible: ${p.available})`
        )
        .join(", ")
      throw new Error(`Stock insuffisant pour: ${details}`)
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

      // Restaurer le stock pour les articles qui seront supprimés ou modifiés
      for (const item of existingOrder.order_items) {
        await tx.product.update({
          where: { id_product: item.id_product },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }

      // Supprimer tous les anciens éléments de commande
      await tx.orderItem.deleteMany({
        where: { id_order: id },
      })

      // Créer les nouveaux éléments de commande et ajuster les stocks
      await Promise.all(
        data.order_items.map(async item => {
          // Créer l'élément de commande
          await tx.orderItem.create({
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

          // Décrémenter le stock du produit pour la nouvelle quantité
          await tx.product.update({
            where: { id_product: item.id_product },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        })
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
    // console.error("Error updating order:", error)
    throw error instanceof Error ? error : new Error("Failed to update order")
  }
}

/**
 * Met à jour le statut d'une commande existante dans la base de données.
 * @param {number} id - ID de la commande à mettre à jour.
 * @param {OrderStatus} status - Nouveau statut de la commande.
 * @returns {Promise<Order>} La commande mise à jour.
 * @throws {Error} Si la commande n'existe pas.
 */
export const updateStatus = async (
  id: number,
  status: OrderStatus
): Promise<Order> => {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id_order: id },
      data: { order_status: status },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
        user: true,
        address: true,
      },
    })

    return updatedOrder
  } catch (error) {
    /*console.error(
      `Erreur lors de la mise à jour du statut de la commande ID ${id}:`,
      error
    )*/
    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      throw new Error(`Commande avec l'ID ${id} non trouvée`)
    }
    throw error instanceof Error
      ? error
      : new Error("Échec de la mise à jour du statut")
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
    console.log(`[Repository] Début suppression commande ${id}`)

    // Vérifier si la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id_order: id },
      include: {
        order_items: true,
      },
    })

    if (!existingOrder) {
      throw new Error(`Commande avec l'ID ${id} non trouvée`)
    }

    // Utiliser une transaction plus robuste
    return await prisma.$transaction(async (tx: TransactionClient) => {
      console.log(
        `[Repository] Suppression des order_items pour commande ${id}`
      )

      // 1. Supprimer d'abord tous les order_items
      await tx.orderItem.deleteMany({
        where: { id_order: id },
      })

      console.log(`[Repository] Restauration des stocks pour commande ${id}`)

      // 2. Restaurer les stocks
      for (const item of existingOrder.order_items) {
        await tx.product.update({
          where: { id_product: item.id_product },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        })
      }

      console.log(`[Repository] Suppression finale de la commande ${id}`)

      // 3. Supprimer la commande
      return await tx.order.delete({
        where: { id_order: id },
        include: {
          order_items: true,
          user: true,
        },
      })
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
        /*console.error(
          `Impossible de supprimer la commande ID ${id} car elle est référencée ailleurs:`,
          error
        )*/
        throw new Error(
          `Impossible de supprimer la commande ID ${id} car elle est référencée par d'autres entités`
        )
      }

      // Autres erreurs techniques
      /*console.error(
        `Erreur lors de la suppression de la commande ID ${id}:`,
        error
      )*/
      throw new Error(
        `Échec de la suppression de la commande ${id}: ${error.message}`
      )
    }

    // Cas générique pour les erreurs non-Error
    /*console.error(
      `Erreur inconnue lors de la suppression de la commande ID ${id}:`,
      error
    )*/
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
 * Récupère les commandes d'un utilisateur spécifique.
 * @param {string} userId - ID de l'utilisateur.
 * @returns {Promise<Order[]>} Liste des commandes de l'utilisateur.
 */
export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
  const orders = await prisma.order.findMany({
    where: { id_user: parseInt(userId) }, // Vérification que l'ID est bien un nombre
    include: {
      order_items: {
        include: {
          product: true, // Inclure les infos du produit pour récupérer le nom du service et le prix
        },
      },
      user: true,
      address: true,
    },
  })

  return orders
}

/**
 * Dépôt de données (repository) pour la gestion des commandes.
 */
const orderRepository = {
  findAll,
  findById,
  create,
  update,
  updateStatus,
  remove,
  exists,
  getOrdersByUserId,
}

export default orderRepository
