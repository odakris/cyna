import productRepository from "@/lib/repositories/product-repository"
import { ProductFormValues } from "@/lib/validations/product-schema"
import { Product } from "@prisma/client"
import categoryRepository from "@/lib/repositories/category-repository"
import { sortProducts } from "@/lib/utils/product-utils"

/**
 * Récupère la liste complète des produits depuis le dépôt de données.
 * @returns {Promise<Product[]>} Liste des produits.
 */
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const products = await productRepository.findAll()
    return sortProducts(products) // Appliquer le tri
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    throw new Error("Erreur lors de la récupération des produits")
  }
}

/**
 * Récupère un produit spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<Product>} Le produit correspondant avec son URL d'image.
 * @throws {Error} Si le produit n'existe pas.
 */
export const getProductById = async (id: number): Promise<Product> => {
  try {
    const product = await productRepository.findById(id)

    if (!product) {
      throw new Error("Produit non trouvé")
    }

    return product
  } catch (error) {
    console.error("Erreur lors de la récupération du produit par ID:", error)
    throw new Error(`Erreur lors de la récupération du produit ${id}`)
  }
}

/**
 * Crée un nouveau produit en base de données.
 * @param {ProductFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<Product>} Le produit nouvellement créé.
 */
export const createProduct = async (
  data: ProductFormValues
): Promise<Product> => {
  try {
    // Vérifier si la catégorie existe
    const categoryExists = await categoryRepository.exists(data.id_category)
    if (!categoryExists) {
      throw new Error(`La catégorie avec l'ID ${data.id_category} n'existe pas`)
    }

    return await productRepository.create(data)
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur spécifique concernant un nom de produit déjà existant
      if (
        error.message.includes("existe déjà") ||
        (error.message.includes("catégorie") &&
          error.message.includes("n'existe pas"))
      ) {
        throw new Error(error.message)
      }
    }

    throw new Error("Erreur lors de la création du produit")
  }
}

/**
 * Met à jour un produit existant avec de nouvelles informations.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @param {ProductFormValues} data - Nouvelles données du produit.
 * @returns {Promise<Product>} Le produit mis à jour.
 * @throws {Error} Si le produit n'existe pas.
 */
export const updateProduct = async (
  id: number,
  data: ProductFormValues
): Promise<Product> => {
  try {
    // Vérifier si le produit existe
    const exists = await productRepository.exists(id)
    if (!exists) {
      throw new Error("Produit non trouvé")
    }

    // Vérifier si la catégorie existe
    const categoryExists = await categoryRepository.exists(data.id_category)
    if (!categoryExists) {
      throw new Error(`La catégorie avec l'ID ${data.id_category} n'existe pas`)
    }

    return await productRepository.update(id, data)
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur spécifique concernant un nom de produit déjà existant
      if (
        error.message.includes("existe déjà") ||
        error.message.includes("non trouvé") ||
        (error.message.includes("catégorie") &&
          error.message.includes("n'existe pas"))
      ) {
        throw new Error(error.message)
      }
    }

    throw new Error(`Erreur lors de la mise à jour du produit ${id}`)
  }
}

/**
 * Supprime un produit de la base de données.
 * @param {number} id - Identifiant du produit à supprimer.
 * @returns {Promise<Object>} Message de confirmation de suppression.
 * @throws {Error} Si le produit n'existe pas.
 */
export const deleteProduct = async (id: number): Promise<object> => {
  try {
    // Vérifier si le produit existe
    const exists = await productRepository.exists(id)
    if (!exists) {
      throw new Error("Produit non trouvé")
    }

    await productRepository.remove(id)
    return { success: true, message: "Produit supprimé avec succès" }
  } catch (error) {
    if (error instanceof Error) {
      // Si le produit n'existe pas
      if (error.message.includes("non trouvé")) {
        throw new Error(error.message)
      }
    }

    throw new Error(`Erreur lors de la suppression du produit ${id}`)
  }
}

/**
 * Active ou désactive un produit.
 * Empêche l'activation si la catégorie du produit est inactive.
 * @param {number} id - Identifiant du produit à modifier.
 * @returns {Promise<{product: Product, blocked?: boolean, reason?: string}>} Le produit avec son statut mis à jour ou un message d'erreur.
 * @throws {Error} Si le produit n'existe pas.
 */
export const toggleProductStatus = async (
  id: number
): Promise<{ product: Product; blocked?: boolean; reason?: string }> => {
  try {
    // Vérifier si le produit existe
    const product = await productRepository.findById(id)
    if (!product) {
      throw new Error("Produit non trouvé")
    }

    // Inverser le statut actif
    const newStatus = !product.active

    // Si on essaie d'activer le produit, vérifier que sa catégorie est active
    if (newStatus) {
      // Récupérer la catégorie du produit
      const category = await categoryRepository.findById(product.id_category)

      // Vérifier si la catégorie existe et est active
      if (!category || !category.active) {
        // Si la catégorie est inactive, bloquer l'activation du produit
        return {
          product,
          blocked: true,
          reason:
            "Impossible d'activer ce produit car sa catégorie est inactive",
        }
      }
    }

    // Si tout est bon, mettre à jour le statut
    const updatedProduct = await productRepository.updateActiveStatus(
      id,
      newStatus
    )
    return { product: updatedProduct }
  } catch (error) {
    console.error("Erreur lors du changement de statut du produit:", error)
    throw error
  }
}

/**
 * Service de gestion des produits, regroupant toutes les fonctionnalités.
 */
const productService = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
}

export default productService
