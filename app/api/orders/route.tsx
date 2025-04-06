import { NextRequest, NextResponse } from "next/server"
import orderController from "@/lib/controllers/order-controller"

/**
 * Récupère tous les commandes.
 *
 * @returns {Promise<NextResponse>} La réponse contenant la liste des commandes.
 */
export async function GET(): Promise<NextResponse> {
  try {
    return await orderController.getAll()
  } catch (error) {
    console.error(
      "Erreur non gérée lors de la récupération des commandes:",
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
 * Crée une nouvelle commande.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les données de la commande.
 * @returns {Promise<NextResponse>} La réponse contenant la commande créée ou un message d'erreur.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    return await orderController.create(request)
  } catch (error) {
    console.error("Erreur non gérée lors de la création de la commande:", error)
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
