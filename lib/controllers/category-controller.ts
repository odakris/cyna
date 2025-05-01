import { NextRequest, NextResponse } from "next/server"
import categoryService from "@/lib/services/category-service"
import { categoryFormSchema } from "@/lib/validations/category-schema"
import { ZodError } from "zod"

/**
 * Récupère la liste complète des catégories depuis la base de données.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la liste des catégories ou une erreur serveur.
 */
export const getAll = async (): Promise<NextResponse> => {
  try {
    const categories = await categoryService.getAllCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Récupère une catégorie spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la catégorie.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la catégorie ou un message d'erreur.
 */
export const getById = async (id: number): Promise<NextResponse> => {
  try {
    const category = await categoryService.getCategoryById(id)
    return NextResponse.json(category)
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de la catégorie par ID:",
      error
    )

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Crée une nouvelle catégorie en validant les données reçues.
 * @param {NextRequest} request - Requête contenant les données de la catégorie.
 * @returns {Promise<NextResponse>} Réponse JSON avec la catégorie créée ou une erreur de validation.
 */
export const create = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = categoryFormSchema.parse(body)
    const newCategory = await categoryService.createCategory(data)
    return NextResponse.json(newCategory, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (
      error instanceof Error &&
      error.message === "Catégorie déjà existante"
    ) {
      return NextResponse.json(
        { message: "Catégorie déjà existante" },
        { status: 409 }
      )
    }
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Met à jour une catégorie existante avec de nouvelles données.
 * @param {NextRequest} request - Requête contenant les nouvelles données de la catégorie.
 * @param {number} id - Identifiant de la catégorie à mettre à jour.
 * @returns {Promise<NextResponse>} Réponse JSON avec la catégorie mise à jour ou une erreur de validation.
 */
export const update = async (
  request: NextRequest,
  id: number
): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = categoryFormSchema.parse(body)
    const updatedCategory = await categoryService.updateCategory(id, data)
    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Supprime une catégorie de la base de données.
 * @param {number} id - Identifiant de la catégorie à supprimer.
 * @returns {Promise<NextResponse>} Réponse JSON avec un message de confirmation ou une erreur.
 */
export const remove = async (id: number): Promise<NextResponse> => {
  try {
    const result = await categoryService.deleteCategory(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Active ou désactive une catégorie et met à jour les produits associés.
 * @param {number} id - Identifiant de la catégorie à modifier.
 * @returns {Promise<NextResponse>} Réponse JSON avec le statut mis à jour et le nombre de produits affectés.
 */
export const toggleCategoryStatus = async (
  id: number
): Promise<NextResponse> => {
  try {
    const result = await categoryService.toggleCategoryStatus(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur lors du changement de statut de la catégorie:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

const categoryController = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleCategoryStatus,
}

export default categoryController
