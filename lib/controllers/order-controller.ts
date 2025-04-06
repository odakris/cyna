import { NextRequest, NextResponse } from "next/server"
import orderService from "@/lib/services/order-service"
import { orderInputSchema } from "@/lib/validations/order-schema"
import { ZodError } from "zod"

/**
 * Récupère la liste complète des commandes depuis la base de données.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la liste des commandes ou une erreur serveur.
 */
export const getAll = async (): Promise<NextResponse> => {
  try {
    const orders = await orderService.getAllOrders()
    return NextResponse.json({ orders, success: true }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des commandes",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
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
    return NextResponse.json({ order, success: true }, { status: 200 })
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la commande par ID:",
      error
    )

    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      // Commande non trouvée
      if (error.message.includes("non trouvée")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 404 }
        )
      }

      // ID invalide
      if (error.message.includes("invalide")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }
    }

    // Erreurs génériques
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur lors de la récupération de la commande",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
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
    console.log("Données reçues pour création de commande:", body)

    // Valider les données d'entrée
    const validatedData = orderInputSchema.parse(body)
    const newOrder = await orderService.createOrder(validatedData)

    return NextResponse.json(
      {
        success: true,
        message: "Commande créée avec succès",
        order: newOrder,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error)

    // Erreurs de validation Zod
    if (error instanceof ZodError) {
      const validationErrors = error.errors
        .map(e => `${e.path.join(".")}: ${e.message}`)
        .join(", ")
      return NextResponse.json(
        {
          success: false,
          error: "Données de commande invalides",
          validationErrors: error.errors,
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Autres erreurs (ex: utilisateur n'existe pas, produit non trouvé)
    if (error instanceof Error && error.message.includes("n'existe pas")) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation échouée",
          details: error.message,
        },
        { status: 400 }
      )
    } else if (
      error instanceof Error &&
      error.message.includes("Stock insuffisant")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock insuffisant",
          details: error.message,
        },
        { status: 400 }
      )
    }

    // Erreur générique
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de la commande",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
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
    console.log(
      `Données reçues pour mise à jour de la commande ID ${id}:`,
      body
    )

    // Valider les données d'entrée
    const validatedData = orderInputSchema.parse(body)
    const updatedOrder = await orderService.updateOrder(id, validatedData)

    return NextResponse.json(
      {
        success: true,
        message: `Commande ${id} mise à jour avec succès`,
        order: updatedOrder,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de la commande ID ${id}:`,
      error
    )

    // Erreurs de validation Zod
    if (error instanceof ZodError) {
      const validationErrors = error.errors
        .map(e => `${e.path.join(".")}: ${e.message}`)
        .join(", ")
      return NextResponse.json(
        {
          success: false,
          error: "Données de commande invalides",
          validationErrors: error.errors,
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    // Commande non trouvée
    if (error instanceof Error && error.message.includes("non trouvée")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 }
      )
    }

    // ID invalide
    if (error instanceof Error && error.message.includes("invalide")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      )
    }

    // Erreur générique
    return NextResponse.json(
      {
        success: false,
        error: `Erreur lors de la mise à jour de la commande ID ${id}`,
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

/**
 * Supprime une commande existante en fonction de son identifiant.
 * @param {number} id - Identifiant de la commande à supprimer.
 * @returns {Promise<NextResponse>} Réponse JSON avec un message de confirmation ou une erreur de validation.
 */
export const remove = async (id: number): Promise<NextResponse> => {
  try {
    await orderService.deleteOrder(id)
    return NextResponse.json(
      {
        success: true,
        message: `Commande ${id} supprimée avec succès`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      `Erreur lors de la suppression de la commande ID ${id}:`,
      error
    )

    // Commande non trouvée
    if (error instanceof Error && error.message.includes("non trouvée")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 404 }
      )
    }

    // ID invalide
    if (error instanceof Error && error.message.includes("invalide")) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 }
      )
    }

    // Contraintes d'intégrité
    if (
      error instanceof Error &&
      (error.message.includes("référencée") ||
        error.message.includes("constraint") ||
        error.message.includes("foreign key"))
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible de supprimer cette commande",
          details: error.message,
        },
        { status: 409 } // Conflict status
      )
    }

    // Erreur générique
    return NextResponse.json(
      {
        success: false,
        error: `Erreur lors de la suppression de la commande ID ${id}`,
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
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
