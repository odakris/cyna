import { NextRequest, NextResponse } from "next/server"
import productService from "@/lib/services/product-service"
import { productFormSchema } from "@/lib/validations/product-schema"

/**
 * Récupère la liste complète des produits depuis la base de données.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la liste des produits ou une erreur serveur.
 */
export const getAll = async (): Promise<NextResponse> => {
  try {
    const products = await productService.getAllProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Récupère un produit spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<NextResponse>} Réponse JSON contenant le produit ou un message d'erreur.
 */
export const getById = async (id: number): Promise<NextResponse> => {
  try {
    const product = await productService.getProductById(id)
    return NextResponse.json(product)
  } catch (error) {
    console.error("Erreur lors de la récupération du produit par ID:", error)

    if (error instanceof Error && error.message === "Produit non trouvé") {
      return NextResponse.json(
        { message: "Produit non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Crée un nouveau produit en validant les données reçues.
 * @param {NextRequest} request - Requête contenant les données du produit.
 * @returns {Promise<NextResponse>} Réponse JSON avec le produit créé ou une erreur de validation.
 */
export const create = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = productFormSchema.parse(body)
    const newProduct = await productService.createProduct(data)
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error)
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Met à jour un produit existant avec de nouvelles données.
 * @param {NextRequest} request - Requête contenant les nouvelles données du produit.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @returns {Promise<NextResponse>} Réponse JSON avec le produit mis à jour ou un message d'erreur.
 */
export const update = async (
  request: NextRequest,
  id: number
): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = productFormSchema.parse(body)
    const updatedProduct = await productService.updateProduct(id, data)
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error)

    if (error instanceof Error && error.message === "Produit non trouvé") {
      return NextResponse.json(
        { message: "Produit non trouvé" },
        { status: 404 }
      )
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Supprime un produit de la base de données en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit à supprimer.
 * @returns {Promise<NextResponse>} Réponse JSON confirmant la suppression ou indiquant une erreur.
 */
export const remove = async (id: number): Promise<NextResponse> => {
  try {
    await productService.deleteProduct(id)
    return NextResponse.json({ message: "Produit supprimé" })
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error)

    if (error instanceof Error && error.message === "Produit non trouvé") {
      return NextResponse.json(
        { message: "Produit non trouvé" },
        { status: 404 }
      )
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Contrôleur des produits regroupant toutes les fonctions pour une importation simplifiée.
 */
const productController = {
  getAll,
  getById,
  create,
  update,
  remove,
}

export default productController
