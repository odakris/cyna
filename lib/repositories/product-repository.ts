import { prisma } from "@/lib/prisma"
import { ProductFormValues } from "@/lib/validations/product-schema"
import { Product } from "@prisma/client"

/**
 * Récupère la liste complète des produits avec leur catégorie associée.
 * @returns {Promise<Product[]>} Liste des produits triés par ordre de priorité.
 */
export const findAll = async (): Promise<Product[]> => {
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
}

/**
 * Récupère un produit spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<Product | null>} Le produit correspondant ou null s'il n'existe pas.
 */
export const findById = async (id: number): Promise<Product | null> => {
  return prisma.product.findUnique({
    where: { id_product: id },
    include: { category: true, product_caroussel_images: true },
  })
}

/**
 * Crée un nouveau produit en base de données.
 * @param {ProductFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<Product>} Le produit nouvellement créé.
 */
export const create = async (data: ProductFormValues): Promise<Product> => {
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
    // Vérifier d'abord si le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id_product: id },
      include: { product_caroussel_images: true },
    })

    if (!existingProduct) {
      throw new Error(`Produit avec l'ID ${id} non trouvé`)
    }

    console.log(`Suppression des images du carrousel pour le produit ${id}`)

    // Utiliser le modèle correct: ProductCarousselImage (avec un P majuscule)
    if (existingProduct.product_caroussel_images.length > 0) {
      await prisma.productCarousselImage.deleteMany({
        where: { id_product: id },
      })
    }

    console.log("Nouvelles images du carrousel:", data.product_caroussel_images)

    // Mettre à jour le produit principal
    const updateData: any = {
      name: data.name.trim(),
      unit_price: data.unit_price,
      description: data.description.trim(),
      technical_specs: data.technical_specs.trim(),
      available: data.available,
      priority_order: data.priority_order,
      updated_at: new Date(),
      id_category: data.id_category,
      stock: data.stock,
      main_image: data.main_image,
    }

    // Ajouter les nouvelles images si elles existent
    if (
      data.product_caroussel_images &&
      data.product_caroussel_images.length > 0
    ) {
      updateData.product_caroussel_images = {
        create: data.product_caroussel_images.map(image => ({
          url: image,
          alt: data.name.trim(),
        })),
      }
    }

    // Mise à jour en une seule opération
    return prisma.product.update({
      where: { id_product: id },
      data: updateData,
      include: {
        product_caroussel_images: true,
      },
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
