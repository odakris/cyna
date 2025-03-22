import productRepository from "@/lib/repositories/product-repository"
import { ProductFormValues } from "@/lib/validations/productSchema"
import { ProductType } from "../../types/Types"

/**
 * Récupère la liste complète des produits depuis le dépôt de données.
 * @returns {Promise<ProductType[]>} Liste des produits.
 */
export const getAllProducts = async (): Promise<ProductType[]> => {
  return productRepository.findAll()
}

/**
 * Récupère un produit spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<ProductType & { imageUrl: string }>} Le produit correspondant avec son URL d'image.
 * @throws {Error} Si le produit n'existe pas.
 */
export const getProductById = async (
  id: number
): Promise<ProductType & { imageUrl: string }> => {
  const product = await productRepository.findById(id)

  if (!product) {
    throw new Error("Produit non trouvé")
  }

  return {
    ...product,
    imageUrl: `${product.image}`,
  }
}

/**
 * Crée un nouveau produit en base de données.
 * @param {ProductFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<ProductType>} Le produit nouvellement créé.
 */
export const createProduct = async (
  data: ProductFormValues
): Promise<ProductType> => {
  return productRepository.create(data)
}

/**
 * Met à jour un produit existant avec de nouvelles informations.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @param {ProductFormValues} data - Nouvelles données du produit.
 * @returns {Promise<ProductType>} Le produit mis à jour.
 * @throws {Error} Si le produit n'existe pas.
 */
export const updateProduct = async (
  id: number,
  data: ProductFormValues
): Promise<ProductType> => {
  const exists = await productRepository.exists(id)

  if (!exists) {
    throw new Error("Produit non trouvé")
  }

  return productRepository.update(id, data)
}

/**
 * Supprime un produit de la base de données.
 * @param {number} id - Identifiant du produit à supprimer.
 * @returns {Promise<Object>} Message de confirmation de suppression.
 * @throws {Error} Si le produit n'existe pas.
 */
export const deleteProduct = async (id: number): Promise<object> => {
  const exists = await productRepository.exists(id)

  if (!exists) {
    throw new Error("Produit non trouvé")
  }

  await productRepository.delete(id)
  return { success: true, message: "Produit supprimé avec succès" }
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
}

export default productService
