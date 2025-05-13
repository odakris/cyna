import { NextRequest, NextResponse } from "next/server"
import { checkPermission } from "@/lib/api-permissions"
import { validateId } from "@/lib/utils/utils"
import categoryController from "@/lib/controllers/category-controller"

/**
 * Active ou désactive une catégorie sans affecter ses autres propriétés.
 * Met également à jour les produits associés à cette catégorie.
 *
 * @param {NextRequest} request - L'objet de requête HTTP.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant la catégorie mise à jour ou un message d'erreur.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("categories:edit")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await categoryController.toggleCategoryStatus(id)
  } catch (error) {
    /* console.error(
      `Erreur non gérée dans la route PATCH /categories/${params.then(p => p.id)}/active:`,
      error
    ) */
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}
