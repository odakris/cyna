/**
 * Formate un nombre en devise Euro
 * @param value - La valeur à formater
 * @returns La valeur formatée (ex: "1 234,56 €")
 */
export const formatEuro = (value: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Formate un nombre en pourcentage
 * @param value - La valeur à formater (0.1 pour 10%)
 * @returns La valeur formatée (ex: "10,0%")
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}
