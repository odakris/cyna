import { useState, useEffect, useCallback } from "react"
import { ProductWithImages } from "@/types/Types"

// Type pour les statistiques des produits
type ProductStats = {
  total: number
  available: number
  unavailable: number
  lowStock: number
}

export function useProductsData() {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tous")
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    available: 0,
    unavailable: 0,
    lowStock: 0,
  })

  // Fonction pour récupérer les produits
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: ProductWithImages[] = await response.json()
      setProducts(data)

      // Calculer les statistiques
      const newStats = {
        total: data.length,
        available: data.filter(p => p.available).length,
        unavailable: data.filter(p => !p.available).length,
        lowStock: data.filter(p => p.stock <= 5).length,
      }
      setStats(newStats)

      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchProducts:", error)
      setError("Erreur lors du chargement des produits")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour supprimer des produits
  const deleteProducts = async (productIds: number[]) => {
    try {
      for (const id of productIds) {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error deleting product ${id}`)
        }
      }

      // Recharger les produits après suppression
      await fetchProducts()
      return true
    } catch (error: unknown) {
      console.error("Erreur deleteProducts:", error)
      throw error
    }
  }

  // Charger les produits lors du montage du composant
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    loading,
    error,
    fetchProducts,
    deleteProducts,
    activeTab,
    setActiveTab,
    stats,
  }
}
