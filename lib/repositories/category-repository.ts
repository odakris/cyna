import { prisma } from "../prisma"
import { CategoryFormValues } from "@/lib/validations/category-schema"
import { Category } from "@prisma/client"
import { TransactionClient } from "@/types/Types"

/**
 * Récupère la liste complète des catégories.
 * @returns {Promise<Category[]>} Liste des catégories triées par ordre alphabétique.
 */
export const findAll = async (): Promise<Category[]> => {
  try {
    return prisma.category.findMany({
      include: {
        products: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    })
  } catch (error) {
    // console.error("Impossible de récupérer la liste des catégories:", error)
    throw new Error("Impossible de récupérer la liste des catégories")
  }
}

/**
 * Récupère une catégorie spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la catégorie.
 * @returns {Promise<Category | null>} La catégorie correspondante ou null si elle n'existe pas.
 */
export const findById = async (id: number): Promise<Category | null> => {
  try {
    return prisma.category.findUnique({
      where: { id_category: id },
      include: {
        products: true,
      },
    })
  } catch (error) {
    // console.error("Impossible de récupérer la catégorie:", error)
    throw new Error(`Impossible de récupérer la catégorie avec l'ID ${id}`)
  }
}

/**
 * Crée une nouvelle catégorie en base de données.
 * @param {CategoryFormValues} data - Données de la catégorie à enregistrer.
 * @returns {Promise<Category>} La catégorie nouvellement créée.
 */
export const create = async (data: CategoryFormValues): Promise<Category> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérification si une catégorie avec le même nom existe déjà
      const existingCategory = await tx.category.findUnique({
        where: { name: data.name.trim() },
      })

      if (existingCategory) {
        throw new Error("Une catégorie avec ce nom existe déjà.")
      }

      return tx.category.create({
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          image: data.image,
          priority_order: data.priority_order,
          active: data.active,
          updated_at: new Date(),
          created_at: new Date(),
        },
      })
    })
  } catch (error) {
    // console.error("Impossible de créer la catégorie:", error)
    throw new Error("Impossible de créer la catégorie")
  }
}

/**
 * Met à jour une catégorie existante avec les nouvelles informations.
 * @param {number} id - Identifiant de la catégorie à mettre à jour.
 * @param {CategoryFormValues} data - Nouvelles données de la catégorie.
 * @returns {Promise<Category>} La catégorie mise à jour.
 */
export const update = async (
  id: number,
  data: CategoryFormValues
): Promise<Category> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si la catégorie existe
      const categoryExists = await tx.category.findUnique({
        where: { id_category: id },
      })
      if (!categoryExists) {
        throw new Error(`La catégorie avec l'ID ${id} n'existe pas`)
      }

      // Vérifier si le nouveau nom de la catégorie existe déjà
      const existingCategory = await tx.category.findFirst({
        where: {
          name: data.name.trim(),
          NOT: { id_category: id }, // Exclure la catégorie actuelle
        },
      })
      if (existingCategory) {
        throw new Error(
          `Une autre catégorie avec le nom '${data.name.trim()}' existe déjà`
        )
      }

      return tx.category.update({
        where: { id_category: id },
        data: {
          name: data.name.trim(),
          description: data.description.trim(),
          image: data.image,
          priority_order: data.priority_order,
          active: data.active,
          updated_at: new Date(),
        },
      })
    })
  } catch (error) {
    // console.error("Impossible de mettre à jour la catégorie:", error)
    throw new Error(`Impossible de mettre à jour la catégorie avec l'ID ${id}`)
  }
}

/**
 * Supprime une catégorie de la base de données.
 * @param {number} id - Identifiant de la catégorie à supprimer.
 * @returns {Promise<Category>} La catégorie supprimée.
 */
export const remove = async (id: number): Promise<Category> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si la catégorie existe
      const category = await tx.category.findUnique({
        where: { id_category: id },
        include: { products: true },
      })
      if (!category) {
        throw new Error(`La catégorie avec l'ID ${id} n'existe pas`)
      }

      // Vérifier si la catégorie a des produits associés
      if (category.products.length > 0) {
        throw new Error(
          `Impossible de supprimer la catégorie car elle contient ${category.products.length} produit(s)`
        )
      }

      return await tx.category.delete({
        where: { id_category: id },
      })
    })
  } catch (error) {
    // console.error("Impossible de supprimer la catégorie:", error)
    throw new Error(`Impossible de supprimer la catégorie avec l'ID ${id}`)
  }
}

/**
 * Vérifie si une catégorie existe dans la base de données.
 * @param {number} id - Identifiant de la catégorie à vérifier.
 * @returns {Promise<boolean>} Retourne true si la catégorie existe, sinon false.
 */
export const exists = async (id: number): Promise<boolean> => {
  try {
    const category = await prisma.category.findUnique({
      where: { id_category: id },
    })

    return category !== null
  } catch (error) {
    // console.error("Impossible de vérifier l'existence de la catégorie:", error)
    throw new Error(
      `Impossible de vérifier l'existence de la catégorie avec l'ID ${id}`
    )
  }
}

/**
 * Met à jour uniquement le statut actif d'une catégorie et de ses produits associés.
 * @param {number} id - Identifiant de la catégorie à mettre à jour.
 * @returns {Promise<{category: Category, productsUpdated: number}>} La catégorie mise à jour et le nombre de produits modifiés.
 */
export const updateActiveStatus = async (
  id: number
): Promise<{ category: Category; productsUpdated: number }> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si la catégorie existe
      const category = await tx.category.findUnique({
        where: { id_category: id },
      })

      if (!category) {
        throw new Error(`La catégorie avec l'ID ${id} n'existe pas`)
      }

      // Inverser le statut actif
      const newStatus = !category.active

      // Mettre à jour la catégorie
      const updatedCategory = await tx.category.update({
        where: { id_category: id },
        data: {
          active: newStatus,
          updated_at: new Date(),
        },
      })

      let productsUpdated = 0

      // Si la catégorie est désactivée, désactiver également tous les produits associés
      if (!newStatus) {
        const result = await tx.product.updateMany({
          where: {
            id_category: id,
            active: true,
          },
          data: {
            active: false,
            updated_at: new Date(),
          },
        })

        productsUpdated = result.count
      }

      return {
        category: updatedCategory,
        productsUpdated,
      }
    })
  } catch (error) {
    /*console.error(
      "Impossible de mettre à jour le statut de la catégorie:",
      error
    )*/
    throw new Error(
      `Impossible de mettre à jour le statut de la catégorie avec l'ID ${id}`
    )
  }
}

const categoryRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
  exists,
  updateActiveStatus,
}

export default categoryRepository
