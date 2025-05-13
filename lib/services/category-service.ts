import categoryRepository from "@/lib/repositories/category-repository"
import { CategoryFormValues } from "../validations/category-schema"
import { Category } from "@prisma/client"

/**
 * Récupère la liste complète des catégories depuis le dépôt de données.
 * @returns {Promise<Category[]>} Liste des catégories.
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    return await categoryRepository.findAll()
  } catch (error) {
    // console.error("Erreur lors de la récupération des catégories:", error)
    throw new Error("Erreur lors de la récupération des catégories")
  }
}

/**
 * Récupère une catégorie spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la catégorie.
 * @returns {Promise<Category>} La catégorie correspondante.
 * @throws {Error} Si la catégorie n'existe pas.
 */
export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    const category = await categoryRepository.findById(id)

    if (!category) {
      throw new Error("Catégorie non trouvée")
    }

    return category
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération de la catégorie par ID:",
      error
    )*/
    throw new Error(`Erreur lors de la récupération de la catégorie ${id}`)
  }
}

/**
 * Crée une nouvelle catégorie en base de données.
 * @param {CategoryFormValues} data - Données de la catégorie à enregistrer.
 * @returns {Promise<Category>} La catégorie nouvellement créée.
 */
export const createCategory = async (
  data: CategoryFormValues
): Promise<Category> => {
  try {
    return await categoryRepository.create(data)
  } catch (error) {
    // Si c'est une erreur spécifique concernant un nom de catégorie déjà existant
    if (error instanceof Error && error.message.includes("existe déjà")) {
      throw new Error(error.message)
    }
    throw new Error("Erreur lors de la création de la catégorie")
  }
}

/**
 * Met à jour une catégorie existante avec de nouvelles informations.
 * @param {number} id - Identifiant de la catégorie à mettre à jour.
 * @param {CategoryFormValues} data - Nouvelles données de la catégorie.
 * @returns {Promise<Category>} La catégorie mise à jour.
 * @throws {Error} Si la catégorie n'existe pas.
 */
export const updateCategory = async (
  id: number,
  data: CategoryFormValues
): Promise<Category> => {
  try {
    // Vérifier si la catégorie existe
    const exists = await categoryRepository.exists(id)
    if (!exists) {
      throw new Error("Catégorie non trouvée")
    }

    return await categoryRepository.update(id, data)
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur spécifique concernant un nom de catégorie déjà existant
      if (
        error.message.includes("existe déjà") ||
        error.message.includes("n'existe pas")
      ) {
        throw new Error(error.message)
      }
    }

    throw new Error(`Erreur lors de la mise à jour de la catégorie ${id}`)
  }
}

/**
 * Supprime une catégorie existante de la base de données.
 * @param {number} id - Identifiant de la catégorie à supprimer.
 * @returns {Promise<void>} Rien si la suppression a réussi.
 * @throws {Error} Si la catégorie n'existe pas.
 */
export const deleteCategory = async (id: number): Promise<object> => {
  try {
    // Vérifier si la catégorie existe
    const exists = await categoryRepository.exists(id)
    if (!exists) {
      throw new Error("Catégorie non trouvée")
    }

    await categoryRepository.remove(id)
    return { success: true, message: "Catégorie supprimée avec succès" }
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur spécifique concernant des produits associés
      if (
        error.message.includes("produit") ||
        error.message.includes("contient")
      ) {
        throw new Error(
          `Impossible de supprimer la catégorie car elle contient des produits associés`
        )
      }

      // Si la catégorie n'existe pas
      if (error.message.includes("n'existe pas")) {
        throw new Error(error.message)
      }
    }

    throw new Error(`Erreur lors de la suppression de la catégorie ${id}`)
  }
}

/**
 * Active ou désactive une catégorie et ses produits associés.
 * @param {number} id - Identifiant de la catégorie à modifier.
 * @returns {Promise<{active: boolean, productsUpdated: number}>} Statut actif et nombre de produits mis à jour.
 */
export const toggleCategoryStatus = async (
  id: number
): Promise<{ active: boolean; productsUpdated: number }> => {
  try {
    // Vérifier si la catégorie existe
    const exists = await categoryRepository.exists(id)
    if (!exists) {
      throw new Error("Catégorie non trouvée")
    }

    // Mettre à jour le statut actif
    const result = await categoryRepository.updateActiveStatus(id)

    return {
      active: result.category.active,
      productsUpdated: result.productsUpdated,
    }
  } catch (error) {
    // console.error("Erreur lors du changement de statut de la catégorie:", error)
    throw error
  }
}

const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
}

export default categoryService
