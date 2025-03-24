import { CategoryType } from "@/types/Types"
import categoryRepository from "@/lib/repositories/category-repository"
import { CategoryFormValues } from "../validations/category-schema"

/**
 * Récupère la liste complète des catégories depuis le dépôt de données.
 * @returns {Promise<CategoryType[]>} Liste des catégories.
 */
export const getAllCategories = async (): Promise<CategoryType[]> => {
  return categoryRepository.findAll()
}

/**
 * Récupère une catégorie spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la catégorie.
 * @returns {Promise<CategoryType>} La catégorie correspondante.
 * @throws {Error} Si la catégorie n'existe pas.
 */
export const getCategoryById = async (id: number): Promise<CategoryType> => {
  const category = await categoryRepository.findById(id)

  if (!category) {
    throw new Error("Catégorie non trouvée")
  }

  return category
}

/**
 * Crée une nouvelle catégorie en base de données.
 * @param {CategoryFormValues} data - Données de la catégorie à enregistrer.
 * @returns {Promise<CategoryType>} La catégorie nouvellement créée.
 */
export const createCategory = async (
  data: CategoryFormValues
): Promise<CategoryType> => {
  return categoryRepository.create(data)
}

/**
 * Met à jour une catégorie existante avec de nouvelles informations.
 * @param {number} id - Identifiant de la catégorie à mettre à jour.
 * @param {CategoryFormValues} data - Nouvelles données de la catégorie.
 * @returns {Promise<CategoryType>} La catégorie mise à jour.
 * @throws {Error} Si la catégorie n'existe pas.
 */
export const updateCategory = async (
  id: number,
  data: CategoryFormValues
): Promise<CategoryType> => {
  const exists = await categoryRepository.exists(id)

  if (!exists) {
    throw new Error("Catégorie non trouvée")
  }

  return categoryRepository.update(id, data)
}

/**
 * Supprime une catégorie existante de la base de données.
 * @param {number} id - Identifiant de la catégorie à supprimer.
 * @returns {Promise<void>} Rien si la suppression a réussi.
 * @throws {Error} Si la catégorie n'existe pas.
 */
export const deleteCategory = async (id: number): Promise<object> => {
  const exists = await categoryRepository.exists(id)

  if (!exists) {
    throw new Error("Catégorie non trouvée")
  }

  await categoryRepository.delete(id)
  return { success: true, message: "Catégorie supprimée avec succès" }
}

const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
}

export default categoryService
