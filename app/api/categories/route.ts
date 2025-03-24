import { NextRequest, NextResponse } from "next/server"
import categoryController from "@/lib/controllers/category-controller"

/**
 * Récupère toutes les categories.
 *
 * @returns {Promise<NextResponse>} La réponse contenant la liste des categories.
 */
export async function GET(): Promise<NextResponse> {
  return categoryController.getAll()
}

/**
 * Crée une nouvelle categorie.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les données de la categorie.
 * @returns {Promise<NextResponse>} La réponse contenant la categorie créé ou un message d'erreur.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return categoryController.create(request)
}
