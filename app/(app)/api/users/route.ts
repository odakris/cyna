import { NextRequest, NextResponse } from "next/server"
import userController from "@/lib/controllers/user-controller"

/**
 * Récupère tous les utilisateurs.
 *
 * @returns {Promise<NextResponse>} La réponse contenant la liste des produits.
 */
export async function GET(): Promise<NextResponse> {
  return userController.getAll()
}

/**
 * Crée un nouvel utilisateur.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les données du produit.
 * @returns {Promise<NextResponse>} La réponse contenant le produit créé ou un message d'erreur.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return userController.create(request)
}
