import { NextRequest, NextResponse } from "next/server"
import productController from "@/lib/controllers/product-controller"

/**
 * Récupère tous les produits.
 *
 * @returns {Promise<NextResponse>} La réponse contenant la liste des produits.
 */
export async function GET(): Promise<NextResponse> {
  try {
    return await productController.getAll()
  } catch (error) {
    console.error("Erreur non gérée dans la route GET /products:", error)
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}

/**
 * Crée un nouveau produit.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les données du produit.
 * @returns {Promise<NextResponse>} La réponse contenant le produit créé ou un message d'erreur.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    return await productController.create(request)
  } catch (error) {
    console.error("Erreur non gérée dans la route POST /products:", error)
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}
