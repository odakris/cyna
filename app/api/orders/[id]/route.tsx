import { NextRequest, NextResponse } from "next/server"
import orderController from "@/lib/controllers/order-controller"
import { validateId } from "@/lib/utils/utils"

/**
 * Récupère une commande par son identifiant.
 *
 * @param {NextRequest} request - L'objet de requête HTTP.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant la commande ou un message d'erreur.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = validateId(params.id)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID invalide",
        },
        { status: 400 }
      )
    }

    return await orderController.getById(id)
  } catch (error) {
    console.error(
      `Erreur non gérée lors de la récupération de la commande ID ${params.id}:`,
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur inattendue",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

/**
 * Met à jour une commande existante.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les nouvelles données.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant la commande mise à jour ou un message d'erreur.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = validateId(params.id)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID invalide",
        },
        { status: 400 }
      )
    }

    return await orderController.update(request, id)
  } catch (error) {
    console.error(
      `Erreur non gérée lors de la mise à jour de la commande ID ${params.id}:`,
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur inattendue",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}

/**
 * Supprime une commande en fonction de son identifiant.
 *
 * @param {NextRequest} request - L'objet de requête HTTP.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse confirmant la suppression ou un message d'erreur.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const id = validateId(params.id)

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID invalide",
        },
        { status: 400 }
      )
    }

    return await orderController.remove(id)
  } catch (error) {
    console.error(
      `Erreur non gérée lors de la suppression de la commande ID ${params.id}:`,
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur inattendue",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}
