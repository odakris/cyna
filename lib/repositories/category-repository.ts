import { prisma } from "../prisma"
import { CategoryFormValues } from "@/lib/validations/category-schema"
import { CategoryType } from "@/types/Types"

/**
 * Récupère la liste complète des catégories.
 * @returns {Promise<CategoryType[]>} Liste des catégories triées par ordre alphabétique.
 */
export const findAll = async (): Promise<CategoryType[]> => {
  return prisma.category.findMany({
    include: {
      products: true,
    },
    orderBy: { name: "asc" },
  })
}

/**
 * Récupère une catégorie spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la catégorie.
 * @returns {Promise<CategoryType | null>} La catégorie correspondante ou null si elle n'existe pas.
 */
export const findById = async (id: number): Promise<CategoryType | null> => {
  return prisma.category.findUnique({
    where: { id_category: id },
    include: {
      products: true,
    },
  })
}

/**
 * Crée une nouvelle catégorie en base de données.
 * @param {CategoryFormValues} data - Données de la catégorie à enregistrer.
 * @returns {Promise<CategoryType>} La catégorie nouvellement créée.
 */
export const create = async (
  data: CategoryFormValues
): Promise<CategoryType> => {
  return prisma.category.create({
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      image: data.image,
      updated_at: new Date(),
      created_at: new Date(),
    },
  })
}

/**
 * Met à jour une catégorie existante avec les nouvelles informations.
 * @param {number} id - Identifiant de la catégorie à mettre à jour.
 * @param {CategoryFormValues} data - Nouvelles données de la catégorie.
 * @returns {Promise<CategoryType>} La catégorie mise à jour.
 */
export const update = async (
  id: number,
  data: CategoryFormValues
): Promise<CategoryType> => {
  return prisma.category.update({
    where: { id_catetegory: id },
    data: {
      name: data.name.trim(),
      description: data.description.trim(),
      image: data.image,
      updated_at: new Date(),
    },
  })
}

/**
 * Supprime une catégorie de la base de données.
 * @param {number} id - Identifiant de la catégorie à supprimer.
 * @returns {Promise<CategoryType>} La catégorie supprimée.
 */
export const deleteCategory = async (id: number): Promise<CategoryType> => {
  return prisma.category.delete({
    where: { id_category: id },
  })
}

export const exists = async (id: number): Promise<boolean> => {
  const category = await prisma.category.findUnique({
    where: { id_category: id },
  })

  return category !== null
}

const categoryRepository = {
  findAll,
  findById,
  create,
  update,
  delete: deleteCategory,
  exists,
}

export default categoryRepository
