import { NextRequest, NextResponse } from "next/server"
import { validateId } from "@/lib/utils/utils"
import userController from "@/lib/controllers/user-controller"
import { checkPermission } from "@/lib/api-permissions"

/**
 * Récupère un Utilisateur par son identifiant.
 *
 * @param {NextRequest} request - L'objet de requête HTTP.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant l'utilisateur ou un message d'erreur.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("users:view")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await userController.getById(id)
  } catch (error) {
    console.error(
      `Erreur non gérée dans la route GET /users/${params.then(p => p.id)}:`,
      error
    )
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}

/**
 * Met à jour un utilisateur existant.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les nouvelles données.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant le produit mis à jour ou un message d'erreur.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("users:edit")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await userController.update(request, id)
  } catch (error) {
    console.error(
      `Erreur non gérée dans la route PUT /users/${params.then(p => p.id)}:`,
      error
    )
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}

/**
 * Supprime un produit en fonction de son identifiant.
 *
 * @param {NextRequest} request - L'objet de requête HTTP.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse confirmant la suppression ou un message d'erreur.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("users:delete")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await userController.remove(id)
  } catch (error) {
    console.error(
      `Erreur non gérée dans la route DELETE /users/${params.then(p => p.id)}:`,
      error
    )
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}
