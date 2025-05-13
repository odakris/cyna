import { NextRequest, NextResponse } from "next/server"
import categoryController from "@/lib/controllers/category-controller"
import { checkPermission } from "@/lib/api-permissions"

/**
 * Récupère toutes les categories.
 *
 * @returns {Promise<NextResponse>} La réponse contenant la liste des categories.
 */
export async function GET(): Promise<NextResponse> {
  try {
    return await categoryController.getAll()
  } catch (error) {
    // console.error("Erreur non gérée dans la route GET /categories:", error)
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}

/**
 * Crée une nouvelle categorie.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les données de la categorie.
 * @returns {Promise<NextResponse>} La réponse contenant la categorie créé ou un message d'erreur.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("categories:create")
    if (permissionCheck) return permissionCheck

    return await categoryController.create(request)
  } catch (error) {
    // console.error("Erreur non gérée dans la route POST /categories:", error)
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}
