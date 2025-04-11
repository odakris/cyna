import { NextRequest, NextResponse } from "next/server"
import productController from "@/lib/controllers/product-controller"
import { validateId } from "@/lib/utils/utils"

/**
 * Récupère un produit par son identifiant.
 *
 * @param {NextRequest} request - L'objet de requête HTTP.
 * @param {{ params: { id: string } }} context - L'objet contenant les paramètres de la requête.
 * @returns {Promise<NextResponse>} La réponse contenant le produit ou un message d'erreur.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Typage correct avec Promise
): Promise<NextResponse> {
  const resolvedParams = await params // Résoudre la Promise
  const id = validateId(resolvedParams.id) // Accéder à id après résolution

  if (!id) {
    return NextResponse.json({ message: "ID invalide" }, { status: 400 })
  }

  return productController.getById(id)
}

/**
 * Met à jour un produit existant.
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

  return productController.update(request, id)
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

  return productController.remove(id)
}
