import { useState, useEffect, useCallback } from "react"
import { CategoryWithProduct } from "@/types/Types"

// Type pour les statistiques des catégories
type CategoryStats = {
  total: number
  withProducts: number
  withoutProducts: number
  highPriority: number
}

export function useCategoriesData() {
  const [categories, setCategories] = useState<CategoryWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("toutes")
  const [stats, setStats] = useState<CategoryStats>({
    total: 0,
    withProducts: 0,
    withoutProducts: 0,
    highPriority: 0,
  })

  // Fonction pour récupérer les catégories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: CategoryWithProduct[] = await response.json()
      setCategories(data)

      // Calculer les statistiques
      const newStats = {
        total: data.length,
        withProducts: data.filter(c => c.products && c.products.length > 0)
          .length,
        withoutProducts: data.filter(
          c => !c.products || c.products.length === 0
        ).length,
        highPriority: data.filter(c => c.priority_order <= 3).length,
      }
      setStats(newStats)

      setError(null)
    } catch (error: unknown) {
      // console.error("Erreur fetchCategories:", error)
      setError("Erreur lors du chargement des catégories")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour supprimer des catégories
  const deleteCategories = async (categoryIds: number[]) => {
    try {
      const failedDeletions: number[] = []

      for (const id of categoryIds) {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          failedDeletions.push(id)
          const errorData = await response.json()
          // console.error(`Erreur de suppression pour l'ID ${id}:`, errorData)
        }
      }

      // Recharger les catégories après suppression
      await fetchCategories()

      if (failedDeletions.length > 0) {
        return {
          success: false,
          message: `Impossible de supprimer ${failedDeletions.length} catégorie(s). Elles peuvent contenir des produits associés.`,
        }
      }

      return { success: true }
    } catch (error: unknown) {
      // console.error("Erreur deleteCategories:", error)
      throw error
    }
  }

  // Charger les catégories lors du montage du composant
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    setError,
    fetchCategories,
    deleteCategories,
    activeTab,
    setActiveTab,
    stats,
  }
}
