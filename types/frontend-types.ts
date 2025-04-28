import { Product, Category } from "@prisma/client"

/**
 * Type pour les catégories avec le comptage de produits
 */
export type CategoryWithProductCount = Category & {
  _count?: {
    products: number
  }
  products?: Product[]
}

/**
 * Type pour les images de carrousel de produit
 */
export type ProductImage = {
  id_product_caroussel_image: number
  url: string
  alt: string | null
}

/**
 * Type pour les produits avec détails (catégorie et images)
 */
export type ProductWithDetails = Product & {
  category: Category
  product_caroussel_images: ProductImage[]
}

/**
 * Type pour les produits en vedette
 */
export type FeaturedProduct = ProductWithDetails & {
  isFeatured?: boolean
}

/**
 * Type pour les filtres de recherche de produits
 */
export type ProductFilterOptions = {
  query?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  onlyAvailable?: boolean
  page?: number
  limit?: number
  sortBy?: "price" | "name" | "date" | "priority"
  sortOrder?: "asc" | "desc"
}
