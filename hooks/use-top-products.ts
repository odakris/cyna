import { useState, useEffect } from "react"
import { FeaturedProduct } from "@/types/frontend-types"

/**
 * Hook personnalisé pour récupérer les produits vedettes depuis l'API
 * @param limit Nombre maximum de produits à afficher
 * @returns Les produits vedettes, l'état de chargement et les éventuelles erreurs
 */
export function useTopProducts(limit: number = 4) {
  const [products, setProducts] = useState<FeaturedProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/products")

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des produits")
        }

        const data = await response.json()

        // Tri par priority_order et limitation au nombre demandé
        const sortedProducts = [...data]
          .sort((a, b) => a.priority_order - b.priority_order)
          .slice(0, limit)
          .map(product => ({ ...product, isFeatured: true }))
          .filter(product => product.active)

        setProducts(sortedProducts)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur inconnue")
        console.error("Erreur:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTopProducts()
  }, [limit])

  return { products, loading, error }
}
