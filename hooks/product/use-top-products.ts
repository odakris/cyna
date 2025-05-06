import { useState, useEffect } from "react"
import { getTopProducts } from "@/lib/utils/product-utils"
import { Product } from "@prisma/client"

/**
 * Hook personnalisé pour récupérer les produits vedettes depuis l'API
 * @param limit Nombre maximum de produits à afficher
 * @returns Les produits vedettes, l'état de chargement et les éventuelles erreurs
 */
export function useTopProducts(limit: number = 4) {
  const [products, setProducts] = useState<Product[]>([])
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

        // Utiliser getTopProducts pour trier et limiter les produits
        const topProducts = getTopProducts(data, limit).map(product => ({
          ...product,
          isFeatured: true,
        }))

        setProducts(topProducts)
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
