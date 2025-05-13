import { NextRequest, NextResponse } from "next/server"
import userController from "@/lib/controllers/user-controller"
import { checkPermission } from "@/lib/api-permissions"

/**
 * Récupère tous les utilisateurs.
 *
 * @returns {Promise<NextResponse>} La réponse contenant la liste des produits.
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("users:view")
    if (permissionCheck) return permissionCheck

    return await userController.getAll()
  } catch (error) {
    // console.error("Erreur non gérée dans la route GET /users:", error)
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}

/**
 * Crée un nouvel utilisateur.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les données du produit.
 * @returns {Promise<NextResponse>} La réponse contenant le produit créé ou un message d'erreur.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("users:create")
    if (permissionCheck) return permissionCheck

    return await userController.create(request)
  } catch (error) {
    // console.error("Erreur non gérée dans la route POST /users:", error)
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}
