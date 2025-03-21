import { ProductFormValues } from "@/lib/validations/productSchema"
import { ProductType } from "@/types/Types"

// Base URL pour l'API, configurable via variable d'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

/**
 * Crée un nouveau produit
 * @param product Données du produit à créer
 * @returns Réponse de l'API
 */
export const createProduct = async (product: ProductFormValues) => {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
    cache: "no-store", // Pas de cache pour les mutations
  })

  console.log("createProduct response:", response)

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message || "Erreur lors de la création du produit.")
  }

  return response.json()
}

/**
 * Met à jour un produit existant
 * @param id ID du produit
 * @param product Données du produit
 * @returns Réponse de l'API
 */
export const updateProduct = async (
  id: number,
  product: Partial<ProductFormValues>
) => {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
    cache: "no-store", // Pas de cache pour les mutations
  })

  console.log("updateProduct response:", response)

  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.message || "Erreur lors de la mise à jour du produit.")
  }

  return response.json()
}

/**
 * Récupère tous les produits
 * @returns Liste des produits
 */
export const getAllProducts = async (): Promise<ProductType[]> => {
  try {
    const response = await fetch(`${API_URL}/api/products`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Revalidation toutes les heures (ISR)
    })

    if (!response.ok) {
      const errorDetails = await response.text()
      throw new Error(
        `Erreur lors de la récupération des produits: ${errorDetails || "Erreur inconnue"}`
      )
    }

    return response.json()
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error)
    return [] // Retourne un tableau vide en cas d'erreur
  }
}

/**
 * Récupère un produit par son ID
 * @param id ID du produit
 * @returns Produit ou null si non trouvé
 */
export const getProductById = async (
  id: string
): Promise<ProductType | null> => {
  try {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Revalidation toutes les heures (ISR)
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Retourne null si le produit n'existe pas
      }
      throw new Error("Erreur lors de la récupération du produit")
    }

    return response.json()
  } catch (error) {
    console.error("Erreur getProductById:", error)
    return null // Retourne null en cas d'erreur
  }
}
