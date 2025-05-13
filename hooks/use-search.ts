import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"

// Type pour les résultats de recherche avec des types Prisma
type ProductSearchResult = {
  id_product: number
  name: string
  description: string
  main_image: string
  category: { name: string } | null
}

type CategorySearchResult = {
  id_category: number
  name: string
  description: string
  image: string
}

type SearchResult = {
  products: ProductSearchResult[]
  categories: CategorySearchResult[]
}

export function useSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult>({
    products: [],
    categories: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fonction pour effectuer la recherche
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ products: [], categories: [] })
      return
    }

    setIsLoading(true)
    try {
      // Encoder les caractères spéciaux dans la requête
      const encodedQuery = encodeURIComponent(searchQuery.trim())
      const response = await fetch(`/api/search?query=${encodedQuery}`)

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }

      const data = (await response.json()) as SearchResult
      setResults(data)
    } catch (error) {
      // console.error("Erreur lors de la recherche:", error)
      setResults({ products: [], categories: [] })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Effectuer la recherche après un délai
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query)
      }, 300) // Délai de 300ms pour éviter trop d'appels API
    } else {
      setResults({ products: [], categories: [] })
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, performSearch])

  // Fonction pour naviguer vers un produit
  const goToProduct = (productId: number) => {
    setShowResults(false)
    setQuery("")
    router.push(`/produit/${productId}`)
  }

  // Fonction pour naviguer vers une catégorie
  const goToCategory = (categoryId: number) => {
    setShowResults(false)
    setQuery("")
    router.push(`/categorie/${categoryId}`)
  }

  // Fonction pour fermer les résultats
  const closeResults = () => {
    setShowResults(false)
  }

  // Fonction pour effectuer une recherche complète
  const performFullSearch = () => {
    if (query.trim()) {
      setShowResults(false)
      router.push(`/produit?query=${encodeURIComponent(query.trim())}`)
      setQuery("")
    }
  }

  return {
    query,
    setQuery,
    results,
    isLoading,
    showResults,
    setShowResults,
    goToProduct,
    goToCategory,
    closeResults,
    performFullSearch,
  }
}
