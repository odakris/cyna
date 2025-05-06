import { Product } from "@prisma/client"

/**
 * Trie les produits selon les règles suivantes:
 * 1. Produits prioritaires d'abord (selon priority_order)
 * 2. Produits disponibles non-prioritaires
 * 3. Produits épuisés (non disponibles) en dernier
 *
 * @param products - Liste des produits à trier
 * @returns Liste des produits triés
 */
export const sortActiveProducts = <
  T extends { active: boolean; available: boolean; priority_order: number },
>(
  products: T[]
): T[] => {
  return [...products]
    .filter(product => product.active) // Filtrer les produits inactifs
    .sort((a, b) => {
      // Trier d'abord par disponibilité (disponibles avant indisponibles)
      if (a.available !== b.available) {
        return a.available ? -1 : 1
      }

      // Ensuite par priority_order (croissant)
      return a.priority_order - b.priority_order
    })
}

export const sortAllProducts = <
  T extends { active: boolean; available: boolean; priority_order: number },
>(
  products: T[]
): T[] => {
  return [...products].sort((a, b) => {
    // Trier d'abord par disponibilité (disponibles avant indisponibles)
    if (a.available !== b.available) {
      return a.available ? -1 : 1
    }

    // Ensuite par priority_order (croissant)
    return a.priority_order - b.priority_order
  })
}

/**
 * Filtre et trie les produits vedettes (priority_order faible et disponibles)
 *
 * @param products - Liste des produits
 * @param limit - Nombre maximum de produits à retourner
 * @returns Liste des produits vedettes triés
 */
export const getTopProducts = <T extends Product>(
  products: T[],
  limit: number = 6
): T[] => {
  // Utiliser sortProducts pour trier les produits
  const sortedProducts = sortActiveProducts(products)

  // Limiter au nombre demandé
  return sortedProducts.slice(0, limit)
}
