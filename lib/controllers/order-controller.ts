import { NextRequest, NextResponse } from "next/server"
import orderService from "@/lib/services/order-service"
import { orderFormSchema } from "@/lib/validations/order-schema"
import orderRepository from "../repositories/order-repository"

/**
 * Récupère la liste complète des commandes depuis la base de données.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la liste des commandes ou une erreur serveur.
 */
export const getAll = async (): Promise<NextResponse> => {
  try {
    const orders = await orderService.getAllOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Récupère une commande spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la commande.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la commande ou un message d'erreur.
 */
export const getById = async (id: number): Promise<NextResponse> => {
  try {
    const order = await orderService.getOrderById(id)
    return NextResponse.json(order)
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la commande par ID:",
      error
    )

    if (error instanceof Error && error.message === "Commande non trouvée") {
      return NextResponse.json(
        { message: "Commande non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Crée une nouvelle commande en validant les données reçues.
 * @param {NextRequest} request - Requête contenant les données de la commande.
 * @returns {Promise<NextResponse>} Réponse JSON avec la commande créée ou une erreur de validation.
 */
export const create = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = orderFormSchema.parse(body)
    const newOrder = await orderService.createOrder(data)
    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error)
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Met à jour une commande existante avec de nouvelles données.
 * @param {NextRequest} request - Requête contenant les nouvelles données de la commande.
 * @param {number} id - Identifiant de la commande à mettre à jour.
 * @returns {Promise<NextResponse>} Réponse JSON avec la commande mise à jour ou une erreur de validation.
 */
export const update = async (
  request: NextRequest,
  id: number
): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = orderFormSchema.parse(body)

    // Vérifier si la commande existe avant de la mettre à jour
    const exists = await orderRepository.exists(id)
    if (!exists) {
      return NextResponse.json(
        { message: "Commande non trouvée" },
        { status: 404 }
      )
    }

    const updatedOrder = await orderService.updateOrder(id, data)
    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error)
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Supprime une commande existante en fonction de son identifiant.
 * @param {number} id - Identifiant de la commande à supprimer.
 * @returns {Promise<NextResponse>} Réponse JSON avec un message de confirmation ou une erreur de validation.
 */
export const remove = async (id: number): Promise<NextResponse> => {
  try {
    const exists = await orderRepository.exists(id)

    if (!exists) {
      return NextResponse.json(
        { message: "Commande non trouvée" },
        { status: 404 }
      )
    }

    await orderService.deleteOrder(id)
    return NextResponse.json({ message: "Commande supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande:", error)
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

const orderController = {
  getAll,
  getById,
  create,
  update,
  remove,
}

export default orderController
