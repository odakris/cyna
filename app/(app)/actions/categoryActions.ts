"use server"

/**
 * Récupère toutes les catégories pour l'interface utilisateur
 * Utilise l'API interne pour obtenir les données
 *
 * @returns {Promise<Array>} La liste des catégories
 */
export async function getCategories() {
  try {
    // Appel à l'API interne
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ""}/api/categories`,
      {
        cache: "no-store",
      }
    )

    if (!response.ok) {
      throw new Error(
        `Erreur lors de la récupération des catégories: ${response.status}`
      )
    }

    return await response.json()
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    // Retour d'un tableau vide en cas d'erreur pour éviter de bloquer l'interface
    return []
  }
}
