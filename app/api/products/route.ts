import { NextRequest, NextResponse } from "next/server"
import productController from "@/lib/controllers/product-controller"

/**
 * Récupère tous les produits.
 *
 * @returns {Promise<NextResponse>} La réponse contenant la liste des produits.
 */
export async function GET(): Promise<NextResponse> {
  return productController.getAll()
}

/**
 * Crée un nouveau produit.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les données du produit.
 * @returns {Promise<NextResponse>} La réponse contenant le produit créé ou un message d'erreur.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return productController.create(request)
}
