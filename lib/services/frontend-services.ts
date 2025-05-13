import {
  ProductWithDetails,
  FeaturedProduct,
  CategoryWithProductCount,
  ProductFilterOptions,
} from "@/types/frontend-types"
import { sortProducts, getTopProducts } from "@/lib/utils/product-utils"

/**
 * Service pour gérer les opérations frontend liées aux produits
 */
export const productService = {
  /**
   * Récupère tous les produits depuis l'API
   */
  async getAllProducts(): Promise<ProductWithDetails[]> {
    try {
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const products = await response.json()
      return sortProducts(products)
    } catch (error) {
      // console.error("Erreur lors de la récupération des produits:", error)
      throw error
    }
  },

  /**
   * Récupère les produits vedettes (triés par priority_order)
   */
  async getFeaturedProducts(limit: number = 4): Promise<FeaturedProduct[]> {
    try {
      const products = await this.getAllProducts()

      // Utiliser getTopProducts pour obtenir les produits vedettes
      return getTopProducts(products, limit).map(product => ({
        ...product,
        isFeatured: true,
      }))
    } catch (error) {
      /*console.error(
        "Erreur lors de la récupération des produits vedettes:",
        error
      )*/
      throw error
    }
  },

  /**
   * Récupère un produit par son ID
   */
  async getProductById(id: number): Promise<ProductWithDetails | null> {
    try {
      const response = await fetch(`/api/products/${id}`)

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // console.error(`Erreur lors de la récupération du produit ${id}:`, error)
      throw error
    }
  },

  /**
   * Recherche des produits selon les critères spécifiés
   */
  async searchProducts(
    options: ProductFilterOptions
  ): Promise<ProductWithDetails[]> {
    try {
      // Construction des paramètres de requête
      const params = new URLSearchParams()

      if (options.query) params.append("query", options.query)
      if (options.categoryId)
        params.append("category", String(options.categoryId))
      if (options.minPrice) params.append("minPrice", String(options.minPrice))
      if (options.maxPrice) params.append("maxPrice", String(options.maxPrice))
      if (options.onlyAvailable) params.append("onlyAvailable", "true")
      if (options.page) params.append("page", String(options.page))
      if (options.limit) params.append("limit", String(options.limit))
      if (options.sortBy) params.append("sortBy", options.sortBy)
      if (options.sortOrder) params.append("sortOrder", options.sortOrder)

      const response = await fetch(`/api/products/search?${params.toString()}`)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      const products = await response.json()
      return sortProducts(products) // Appliquer le tri
    } catch (error) {
      // console.error("Erreur lors de la recherche de produits:", error)
      throw error
    }
  },
}

/**
 * Service pour gérer les opérations frontend liées aux catégories
 */
export const categoryService = {
  /**
   * Récupère toutes les catégories depuis l'API
   */
  async getAllCategories(): Promise<CategoryWithProductCount[]> {
    try {
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // console.error("Erreur lors de la récupération des catégories:", error)
      throw error
    }
  },

  /**
   * Récupère une catégorie par son ID
   */
  async getCategoryById(id: number): Promise<CategoryWithProductCount | null> {
    try {
      const response = await fetch(`/api/categories/${id}`)

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      /*console.error(
        `Erreur lors de la récupération de la catégorie ${id}:`,
        error
      )*/
      throw error
    }
  },

  /**
   * Récupère les produits d'une catégorie spécifique
   */
  async getProductsByCategory(
    categoryId: number
  ): Promise<ProductWithDetails[]> {
    try {
      return await productService.searchProducts({ categoryId })
    } catch (error) {
      /*console.error(
        `Erreur lors de la récupération des produits de la catégorie ${categoryId}:`,
        error
      )*/
      throw error
    }
  },
}
