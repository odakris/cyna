import { useState, useEffect } from "react"
import { ProductWithImages } from "@/types/Types"

/**
 * Hook personnalisé pour récupérer un produit par son ID
 * @param id L'identifiant du produit
 * @returns Le produit, l'état de chargement et les éventuelles erreurs
 */
export function useProduct(id: string | string[] | null | undefined) {
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products/${id}`)

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du produit")
        }

        const data = await response.json()
        setProduct(data)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Erreur inconnue")
        console.error("Erreur lors de la récupération du produit:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  return { product, loading, error }
}
