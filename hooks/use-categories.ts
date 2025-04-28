import { useState, useEffect } from "react"
import { CategoryWithProductCount } from "@/types/frontend-types"

/**
 * Hook personnalisé pour récupérer les catégories depuis l'API
 * @returns Les catégories, l'état de chargement et les éventuelles erreurs
 */
export function useCategories() {
  const [categories, setCategories] = useState<CategoryWithProductCount[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/categories")

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des catégories")
        }

        const data = await response.json()
        setCategories(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur inconnue")
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
