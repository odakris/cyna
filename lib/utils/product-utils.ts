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
export const sortProducts = <T extends Product>(products: T[]): T[] => {
  return [...products].sort((a, b) => {
    // Gérer d'abord le cas des produits non disponibles (toujours en dernier)
    if (a.available !== b.available) {
      return a.available ? -1 : 1
    }

    // Si les deux produits ont le même statut de disponibilité,
    // trier par priority_order (plus petit = plus prioritaire)
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
  // Filtrer uniquement les produits disponibles pour les produits vedettes
  const availableProducts = products.filter(product => product.available)

  // Trier par priority_order
  const sortedProducts = availableProducts.sort(
    (a, b) => a.priority_order - b.priority_order
  )

  // Limiter au nombre demandé
  return sortedProducts.slice(0, limit)
}
