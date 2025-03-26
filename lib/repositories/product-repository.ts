import { prisma } from "@/lib/prisma"
import { ProductFormValues } from "@/lib/validations/product-schema"
import { ProductType } from "@/types/Types"

/**
 * Récupère la liste complète des produits avec leur catégorie associée.
 * @returns {Promise<ProductType[]>} Liste des produits triés par ordre de priorité.
 */
export const findAll = async (): Promise<ProductType[]> => {
  return prisma.product.findMany({
    include: {
      category: {
        select: { id_category: true, name: true },
      },
    },
    orderBy: { priority_order: "asc" },
  })
}

/**
 * Récupère un produit spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<ProductType | null>} Le produit correspondant ou null s'il n'existe pas.
 */
export const findById = async (id: number): Promise<ProductType | null> => {
  return prisma.product.findUnique({
    where: { id_product: id },
    include: { category: true },
  })
}

/**
 * Crée un nouveau produit en base de données.
 * @param {ProductFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<ProductType>} Le produit nouvellement créé.
 */
export const create = async (data: ProductFormValues): Promise<ProductType> => {
  return prisma.product.create({
    data: {
      name: data.name.trim(),
      unit_price: data.unit_price,
      description: data.description.trim(),
      technical_specs: data.technical_specs.trim(),
      available: true,
      priority_order: data.priority_order,
      updated_at: new Date(),
      created_at: new Date(),
      stock: data.stock,
      image: data.image,
      category: { connect: { id_category: data.id_category } },
    },
  })
}

/**
 * Met à jour un produit existant avec les nouvelles informations.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @param {ProductFormValues} data - Nouvelles données du produit.
 * @returns {Promise<ProductType>} Le produit mis à jour.
 */
export const update = async (
  id: number,
  data: ProductFormValues
): Promise<ProductType> => {
  return prisma.product.update({
    where: { id_product: id },
    data: {
      name: data.name.trim(),
      unit_price: data.unit_price,
      description: data.description.trim(),
      technical_specs: data.technical_specs.trim(),
      available: data.available,
      priority_order: data.priority_order,
      updated_at: new Date(),
      id_category: data.id_category,
      image: data.image,
      stock: Math.max(0, data.stock),
    },
  })
}

/**
 * Supprime un produit de la base de données en fonction de son identifiant.
 * @param {number} id - Identifiant du produit à supprimer.
 * @returns {Promise<ProductType>} Confirmation de la suppression du produit.
 */
export const remove = async (id: number): Promise<ProductType> => {
  return prisma.product.delete({
    where: { id_product: id },
  })
}

/**
 * Vérifie si un produit existe en base de données.
 * @param {number} id - Identifiant du produit à vérifier.
 * @returns {Promise<boolean>} Retourne true si le produit existe, sinon false.
 */
export const exists = async (id: number): Promise<boolean> => {
  const count = await prisma.product.count({
    where: { id_product: id },
  })
  return count > 0
}

/**
 * Dépôt de données (repository) pour la gestion des produits.
 */
const productRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
  exists,
}

export default productRepository
