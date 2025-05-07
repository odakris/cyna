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

export function formatDate(dateString?: string) {
  if (!dateString) return "Date inconnue"
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
