import { NextRequest, NextResponse } from "next/server"
import categoryController from "@/lib/controllers/category-controller"
import { validateId } from "@/lib/utils/utils"

/**
 * Récupère une categorie par son identifiant.
 *
 * @param {NextRequest} request - L'objet de requête HTTP.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant la categorie ou un message d'erreur.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const resolvedParams = await params // Attendre la résolution des paramètres
  const id = validateId(resolvedParams.id) // Accéder à id après résolution

  if (!id) {
    return NextResponse.json({ message: "ID invalide" }, { status: 400 })
  }

  return categoryController.getById(id)
}

/**
 * Met à jour une categorie existante.
 *
 * @param {NextRequest} request - L'objet de requête HTTP contenant les nouvelles données.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant la categorie mis à jour ou un message d'erreur.
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

  return categoryController.update(request, id)
}

/**
 * Supprime une categorie en fonction de son identifiant.
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

  return categoryController.remove(id)
}
