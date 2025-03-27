import { NextRequest, NextResponse } from "next/server"
import { validateId } from "@/lib/utils/utils"
import userController from "@/lib/controllers/user-controller"

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
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)

  if (!id) {
    return NextResponse.json({ message: "ID invalide" }, { status: 400 })
  }

  return userController.getById(id)
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
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)

  if (!id) {
    return NextResponse.json({ message: "ID invalide" }, { status: 400 })
  }

  return userController.update(request, id)
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
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)

  if (!id) {
    return NextResponse.json({ message: "ID invalide" }, { status: 400 })
  }

  return userController.remove(id)
}
