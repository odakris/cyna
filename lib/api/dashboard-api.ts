import { ChartData, CategorySalesData, TimeFrame } from "@/types/dashboard"

/**
 * Récupère les données de ventes quotidiennes
 * @param timeFrame - Période de temps
 * @returns Données de ventes quotidiennes
 */
export const fetchDailySales = async (
  timeFrame: TimeFrame
): Promise<ChartData[]> => {
  try {
    const response = await fetch(
      `/api/dashboard/daily-sales?timeFrame=${timeFrame}`
    )

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.dailySales || []
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération des ventes quotidiennes:",
      error
    )*/
    throw error
  }
}

/**
 * Récupère les données de ventes par catégorie
 * @param timeFrame - Période de temps
 * @returns Données de ventes par catégorie
 */
export const fetchCategorySales = async (
  timeFrame: TimeFrame
): Promise<CategorySalesData[]> => {
  try {
    const response = await fetch(
      `/api/dashboard/category-sales?timeFrame=${timeFrame}`
    )

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.categorySales || []
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération des ventes par catégorie:",
      error
    )*/
    throw error
  }
}

/**
 * Récupère les données de panier moyen par catégorie
 * @param timeFrame - Période de temps
 * @returns Données de panier moyen par catégorie
 */
export const fetchAverageCartByCategory = async (
  timeFrame: TimeFrame
): Promise<ChartData[]> => {
  try {
    const response = await fetch(
      `/api/dashboard/average-cart?timeFrame=${timeFrame}`
    )

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`)
    }

    const data = await response.json()
    return data.averageCartByCategory || []
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération des paniers moyens par catégorie:",
      error
    )*/
    throw error
  }
}
