import { prisma } from "@/lib/prisma"
import { ProductFormValues } from "@/lib/validations/product-schema"
import { Product } from "@prisma/client"
import { TransactionClient } from "@/types/Types"

/**
 * Récupère la liste complète des produits avec leur catégorie associée.
 * @returns {Promise<Product[]>} Liste des produits triés par ordre de priorité.
 */
export const findAll = async (): Promise<Product[]> => {
  try {
    return prisma.product.findMany({
      include: {
        category: {
          select: { id_category: true, name: true },
        },
        product_caroussel_images: {
          select: { id_product_caroussel_image: true, url: true, alt: true },
        },
      },
      orderBy: { priority_order: "asc" },
    })
  } catch (error) {
    console.error("Impossible de récupérer la liste des produits:", error)
    throw new Error("Impossible de récupérer la liste des produits")
  }
}

/**
 * Récupère un produit spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<Product | null>} Le produit correspondant ou null s'il n'existe pas.
 */
export const findById = async (id: number): Promise<Product | null> => {
  try {
    return prisma.product.findUnique({
      where: { id_product: id },
      include: { category: true, product_caroussel_images: true },
    })
  } catch (error) {
    console.error("Impossible de récupérer le produit:", error)
    throw new Error(`Impossible de récupérer le produit avec l'ID ${id}`)
  }
}

/**
 * Crée un nouveau produit en base de données.
 * @param {ProductFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<Product>} Le produit nouvellement créé.
 */
export const create = async (data: ProductFormValues): Promise<Product> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si la catégorie existe
      const categoryExists = await tx.category.findUnique({
        where: { id_category: data.id_category },
      })
      if (!categoryExists) {
        throw new Error(
          `La catégorie avec l'ID ${data.id_category} n'existe pas`
        )
      }

      // Vérifier si un produit avec le même nom existe déjà
      const existingProduct = await tx.product.findUnique({
        where: { name: data.name.trim() },
      })
      if (existingProduct) {
        throw new Error(
          `Un produit avec le nom '${data.name.trim()}' existe déjà`
        )
      }

      return await tx.product.create({
        data: {
          name: data.name.trim(),
          unit_price: data.unit_price,
          description: data.description.trim(),
          technical_specs: data.technical_specs.trim(),
          available: data.available,
          priority_order: data.priority_order,
          updated_at: new Date(),
          created_at: new Date(),
          stock: data.stock,
          active: data.active,
          category: { connect: { id_category: data.id_category } },
          main_image: data.main_image,
          product_caroussel_images: {
            create: data.product_caroussel_images.map(image => ({
              url: image,
              alt: image.trim(),
            })),
          },
        },
      })
    })
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error)
    throw new Error("Impossible de créer le produit")
  }
}

/**
 * Met à jour un produit existant avec les nouvelles informations.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @param {ProductFormValues} data - Nouvelles données du produit.
 * @returns {Promise<Product>} Le produit mis à jour.
 */
export const update = async (
  id: number,
  data: ProductFormValues
): Promise<Product> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si le produit existe
      const existingProduct = await tx.product.findUnique({
        where: { id_product: id },
        include: { product_caroussel_images: true },
      })

      if (!existingProduct) {
        throw new Error(`Produit avec l'ID ${id} non trouvé`)
      }

      // Vérifier si la catégorie existe
      const categoryExists = await tx.category.findUnique({
        where: { id_category: data.id_category },
      })

      if (!categoryExists) {
        throw new Error(
          `La catégorie avec l'ID ${data.id_category} n'existe pas`
        )
      }

      // Vérifier si un autre produit avec le même nom existe déjà
      const duplicateProduct = await tx.product.findFirst({
        where: {
          name: data.name.trim(),
          id_product: { not: id },
        },
      })

      if (duplicateProduct) {
        throw new Error(
          `Un autre produit avec le nom '${data.name.trim()}' existe déjà`
        )
      }

      // Supprimer les images du carrousel existantes si nécessaire
      if (existingProduct.product_caroussel_images.length > 0) {
        await tx.productCarousselImage.deleteMany({
          where: { id_product: id },
        })
      }

      // Préparer les données de mise à jour
      const updateData = {
        name: data.name.trim(),
        unit_price: data.unit_price,
        description: data.description.trim(),
        technical_specs: data.technical_specs.trim(),
        available: data.available,
        priority_order: data.priority_order,
        updated_at: new Date(),
        id_category: data.id_category,
        stock: data.stock,
        active: data.active,
        main_image: data.main_image,
        product_caroussel_images: {
          create:
            data.product_caroussel_images &&
            data.product_caroussel_images.length > 0
              ? data.product_caroussel_images.map(image => ({
                  url: image,
                  alt: data.name.trim(),
                }))
              : [],
        },
      }

      // Mise à jour en une seule opération
      return await tx.product.update({
        where: { id_product: id },
        data: updateData,
        include: {
          product_caroussel_images: true,
        },
      })
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error)
    throw error
  }
}

/**
 * Supprime un produit de la base de données en fonction de son identifiant.
 * @param {number} id - Identifiant du produit à supprimer.
 * @returns {Promise<Product>} Confirmation de la suppression du produit.
 */
export const remove = async (id: number): Promise<Product> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si le produit existe
      const existingProduct = await tx.product.findUnique({
        where: { id_product: id },
        include: { product_caroussel_images: true },
      })

      if (!existingProduct) {
        throw new Error(`Produit avec l'ID ${id} non trouvé`)
      }

      // Supprimer d'abord les images du carrousel associées
      if (existingProduct.product_caroussel_images.length > 0) {
        await tx.productCarousselImage.deleteMany({
          where: { id_product: id },
        })
      }

      // Supprimer ensuite le produit
      return await tx.product.delete({
        where: { id_product: id },
      })
    })
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error)
    throw new Error(`Impossible de supprimer le produit avec l'ID ${id}`)
  }
}

/**
 * Vérifie si un produit existe en base de données.
 * @param {number} id - Identifiant du produit à vérifier.
 * @returns {Promise<boolean>} Retourne true si le produit existe, sinon false.
 */
export const exists = async (id: number): Promise<boolean> => {
  try {
    const count = await prisma.product.count({
      where: { id_product: id },
    })
    return count > 0
  } catch (error) {
    console.error(
      "Erreur lors de la vérification de l'existence du produit:",
      error
    )
    throw new Error(
      `Impossible de vérifier l'existence du produit avec l'ID ${id}`
    )
  }
}

/**
 * Met à jour uniquement le statut actif d'un produit.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @param {boolean} active - Le nouveau statut actif du produit.
 * @returns {Promise<Product>} Le produit mis à jour.
 */
export const updateActiveStatus = async (
  id: number,
  active: boolean
): Promise<Product> => {
  try {
    return await prisma.product.update({
      where: { id_product: id },
      data: {
        active,
        updated_at: new Date(),
      },
      include: {
        category: true,
        product_caroussel_images: true,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut actif:", error)
    throw error
  }
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
  updateActiveStatus,
}

export default productRepository
