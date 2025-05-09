import { NextRequest, NextResponse } from "next/server"
import orderService from "@/lib/services/order-service"
import { orderInputSchema, statusSchema } from "@/lib/validations/order-schema"
import { ZodError } from "zod"
import { checkPermission } from "../api-permissions"
import { Role } from "@prisma/client"

// Nouvelle fonction pour supporter ta route API
async function createWithParams(
  data: any,
  userId?: string,
  guestId?: string
): Promise<NextResponse> {
  console.log(
    "[OrderController] Données reçues pour création de commande (createWithParams):",
    JSON.stringify(data, null, 2)
  )

  try {
    if (!data || typeof data !== "object") {
      console.error("[OrderController] Données data invalides:", { data })
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "Les données de la commande doivent être un objet non vide",
        },
        { status: 400 }
      )
    }

    // Construire le payload avec id_user et guestId
    const payload = {
      ...data,
      id_user:
        userId && !isNaN(parseInt(userId)) ? parseInt(userId) : undefined,
      guestId: guestId || undefined,
    }

    console.log(
      "[OrderController] Payload avant validation:",
      JSON.stringify(payload, null, 2)
    )

    // Valider les données avec le même schéma que la fonction create
    const validatedData = orderInputSchema.parse(payload)
    console.log(
      "[OrderController] Données validées:",
      JSON.stringify(validatedData, null, 2)
    )

    // Appeler la même méthode du service que la fonction create
    const newOrder = await orderService.createOrder(validatedData)
    console.log(
      "[OrderController] Commande créée:",
      JSON.stringify(newOrder, null, 2)
    )

    return NextResponse.json(
      {
        success: true,
        message: "Commande créée avec succès",
        order: newOrder,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(
      "[OrderController] Erreur lors de la création de la commande:",
      error
    )

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

    if (error instanceof Error) {
      if (error.message.includes("non trouvée")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 404 }
        )
      }
      if (error.message.includes("invalide")) {
        return NextResponse.json(
          { success: false, message: error.message },
          { status: 400 }
        )
      }
    }

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

    if (error instanceof Error && error.message.includes("non trouvée")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes("invalide")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

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
 * Met à jour le statut d'une commande existante.
 * @param {NextRequest} request - Requête contenant le nouveau statut.
 * @param {number} id - Identifiant de la commande à mettre à jour.
 * @returns {Promise<NextResponse>} Réponse JSON avec la commande mise à jour ou une erreur de validation.
 */
export const updateStatus = async (
  request: NextRequest,
  id: number
): Promise<NextResponse> => {
  try {
    const body = await request.json()

    const { order_status } = statusSchema.parse(body)
    const updatedOrder = await orderService.updateOrderStatus(id, order_status)

    return NextResponse.json(
      {
        success: true,
        message: `Statut de la commande ${id} mis à jour avec succès`,
        order: updatedOrder,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour du statut de la commande ID ${id}:`,
      error
    )

    if (error instanceof ZodError) {
      const validationErrors = error.errors
        .map(e => `${e.path.join(".")}: ${e.message}`)
        .join(", ")
      return NextResponse.json(
        {
          success: false,
          error: "Données de statut invalides",
          validationErrors: error.errors,
          details: validationErrors,
        },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes("non trouvée")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes("invalide")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: `Erreur lors de la mise à jour du statut de la commande ID ${id}`,
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
export const remove = async (
  id: number,
  userRole?: Role
): Promise<NextResponse> => {
  try {
    // Vérification des permissions sauf pour SUPER_ADMIN
    if (userRole !== Role.SUPER_ADMIN) {
      const permissionCheck = await checkPermission("orders:delete")
      if (permissionCheck) return permissionCheck
    }

    // Ajouter des logs
    console.log(
      `[OrderController] Tentative de suppression ID ${id}, role: ${userRole}`
    )

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

    if (error instanceof Error && error.message.includes("non trouvée")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      )
    }

    if (error instanceof Error && error.message.includes("invalide")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

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
        { status: 409 }
      )
    }

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

/**
 * Récupère les commandes d'un utilisateur spécifique.
 * @param {string} id - Identifiant de l'utilisateur.
 * @returns {Promise<NextResponse>} Réponse JSON contenant les commandes ou une erreur.
 */
export const getUserOrders = async (id: string): Promise<NextResponse> => {
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const orders = await orderService.getUserOrders(id)

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Aucune commande trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error("OrderController Error fetching orders:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des commandes",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

/**
 * Récupère l'historique des commandes d'un utilisateur pour affichage.
 * @param {string} id - Identifiant de l'utilisateur.
 * @param {NextRequest} req - Requête contenant les filtres.
 * @returns {Promise<NextResponse>} Réponse JSON contenant l'historique des commandes ou une erreur.
 */
export const getUserOrderHistoryForDisplay = async (
  id: string,
  req?: NextRequest
): Promise<NextResponse> => {
  if (!id) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 })
  }

  try {
    const userId = parseInt(id)
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "User ID must be a valid positive number" },
        { status: 400 }
      )
    }

    let filters
    if (req) {
      const url = new URL(req.url)
      filters = {
        year: url.searchParams.get("year") || undefined,
        day: url.searchParams.get("day") || undefined,
        month: url.searchParams.get("month") || undefined,
        categoryIds: url.searchParams.get("category_ids") || undefined,
        orderStatus: url.searchParams.get("order_status") || undefined,
        service_name: url.searchParams.get("service_name") || undefined,
      }
    }

    const orders = await orderService.getUserOrderHistory(id, filters)

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { error: "Aucune commande trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(orders, { status: 200 })
  } catch (error) {
    console.error("OrderController Error fetching order history:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de l'historique des commandes",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}


const orderController = {
  createWithParams, // Nouvelle fonction pour ta route API
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
  getUserOrders,
  getUserOrderHistoryForDisplay,
}

export default orderController
