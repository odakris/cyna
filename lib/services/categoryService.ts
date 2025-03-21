import { CategoryType } from "@/types/Types"

// Base URL pour l'API, configurable via variable d'environnement
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

/**
 * Récupère toutes les catégories
 * @returns Liste des catégories
 */
export const getAllCategories = async (): Promise<CategoryType[]> => {
  try {
    const response = await fetch(`${API_URL}/api/categories`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Revalidation toutes les heures (ISR)
    })

    if (!response.ok) {
      const errorDetails = await response.text()
      throw new Error(
        `Erreur lors de la récupération des catégories: ${errorDetails || "Erreur inconnue"}`
      )
    }

    return response.json()
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return [] // Retourne un tableau vide en cas d'erreur
  }
}

/**
 * Récupère une catégorie par son ID
 * @param id ID de la catégorie
 * @returns Catégorie ou null si non trouvée
 */
export const getCategoryById = async (
  id: string
): Promise<CategoryType | null> => {
  try {
    const response = await fetch(`${API_URL}/api/categories/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Revalidation toutes les heures (ISR)
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null // Retourne null si la catégorie n'existe pas
      }
      const errorDetails = await response.text()
      throw new Error(
        `Erreur lors de la récupération de la catégorie: ${errorDetails || "Erreur inconnue"}`
      )
    }

    return response.json()
  } catch (error) {
    console.error("Erreur getCategoryById:", error)
    return null // Retourne null en cas d'erreur
  }
}
