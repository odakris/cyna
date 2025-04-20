// Types pour les données du tableau de bord

export type TimeFrame = "week" | "month" | "5weeks"

// Structure commune pour les données de graphique avec date
export interface ChartData {
  date: string
  value: number
  category?: string // Pour les graphiques par catégorie
}

// Structure pour les données de vente par catégorie (camembert)
export interface CategorySalesData {
  name: string
  value: number
  percentage?: number // Calculé à partir de la valeur
}

// Structure pour les options de période
export interface TimeFrameOption {
  label: string
  value: TimeFrame
}

// Structure pour les données de réponse de l'API
export interface DashboardDataResponse {
  success: boolean
  data?: {
    dailySales?: ChartData[]
    categorySales?: CategorySalesData[]
    averageCartByCategory?: ChartData[]
  }
  error?: string
}

// Structure pour représenter la forme des entités du graphique AverageCart après transformation
export interface TransformedChartData {
  date: string
  [categoryName: string]: number | string
}

// Structure pour représenter les données formatées du graphique camembert
export interface FormattedCategorySalesData extends CategorySalesData {
  percentage: number
}
