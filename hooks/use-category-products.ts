import { useState, useEffect } from "react"
import { CategoryWithProductCount } from "@/types/frontend-types"
import { Product } from "@prisma/client"

interface CategoryWithProducts extends CategoryWithProductCount {
  products: Product[]
}

/**
 * Hook personnalisé pour récupérer une catégorie et ses produits
 * @param id L'identifiant de la catégorie
 * @returns La catégorie avec ses produits, l'état de chargement et les éventuelles erreurs
 */
export function useCategoryProducts(id: string | string[] | null | undefined) {
  const [category, setCategory] = useState<CategoryWithProducts | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchCategoryWithProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/categories/${id}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération de la catégorie")
        }

        const data = await response.json()
        setCategory(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur inconnue")
        console.error("Erreur lors de la récupération de la catégorie:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryWithProducts()
  }, [id])

  return { category, loading, error }
}
