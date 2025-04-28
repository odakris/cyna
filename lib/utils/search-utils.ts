import { Product } from "@prisma/client"

/**
 * Calcule le score de priorité pour un produit selon les règles de correspondance définies
 * Règles de priorité: Exact > Un caractère différent > Commence par > Contient
 *
 * @param product - Le produit à évaluer
 * @param searchTerm - Le terme de recherche
 * @param field - Le champ à considérer (nom ou description)
 * @returns Un score de priorité (plus petit = plus prioritaire)
 */
export function calculatePriorityScore(
  product: Product,
  searchTerm: string,
  field: "name" | "description" | "technical_specs"
): number {
  if (!searchTerm) return 999 // Pas de terme de recherche, priorité basse

  const value = (product[field] as string)?.toLowerCase() || ""
  searchTerm = searchTerm.toLowerCase()

  // Règle 1: Correspondance exacte (priorité la plus haute)
  if (value === searchTerm) return 1

  // Règle 2: Un caractère différent (priorité haute)
  if (levenshteinDistance(value, searchTerm) === 1) return 2

  // Règle 3: Commence par (priorité moyenne)
  if (value.startsWith(searchTerm)) return 3

  // Règle 4: Contient (priorité basse)
  if (value.includes(searchTerm)) return 4

  // Aucune correspondance
  return 999
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 * (nombre minimum de modifications requises pour transformer une chaîne en une autre)
 *
 * @param a - Première chaîne
 * @param b - Deuxième chaîne
 * @returns La distance entre les deux chaînes
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = []

  // Initialisation de la matrice
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  // Remplissage de la matrice
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // suppression
          )
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Trie les produits selon les règles de priorité définies dans le cahier des charges
 * pour les recherches textuelles
 *
 * @param products - Liste des produits à trier
 * @param titleQuery - Terme de recherche pour le titre
 * @param descriptionQuery - Terme de recherche pour la description
 * @param featuresQuery - Terme de recherche pour les caractéristiques techniques
 * @returns La liste des produits triés selon les priorités
 */
export function sortProductsBySearchPriority(
  products: Product[],
  titleQuery?: string | null,
  descriptionQuery?: string | null,
  featuresQuery?: string | null
): Product[] {
  return [...products].sort((a, b) => {
    // Scores pour les différents critères
    let scoreA = 999
    let scoreB = 999

    // Score pour le titre (priorité la plus haute)
    if (titleQuery) {
      const titleScoreA = calculatePriorityScore(a, titleQuery, "name")
      const titleScoreB = calculatePriorityScore(b, titleQuery, "name")

      // Si un produit a une correspondance exacte dans le titre, lui donner une priorité très élevée
      if (titleScoreA < scoreA) scoreA = titleScoreA
      if (titleScoreB < scoreB) scoreB = titleScoreB
    }

    // Score pour la description (priorité moyenne)
    if (descriptionQuery) {
      const descScoreA =
        calculatePriorityScore(a, descriptionQuery, "description") + 10
      const descScoreB =
        calculatePriorityScore(b, descriptionQuery, "description") + 10

      if (descScoreA < scoreA) scoreA = descScoreA
      if (descScoreB < scoreB) scoreB = descScoreB
    }

    // Score pour les caractéristiques techniques (priorité basse)
    if (featuresQuery) {
      const featScoreA =
        calculatePriorityScore(a, featuresQuery, "technical_specs") + 20
      const featScoreB =
        calculatePriorityScore(b, featuresQuery, "technical_specs") + 20

      if (featScoreA < scoreA) scoreA = featScoreA
      if (featScoreB < scoreB) scoreB = featScoreB
    }

    // Comparer les scores (les scores plus bas = priorité plus élevée)
    return scoreA - scoreB
  })
}
