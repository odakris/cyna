/**
 * Valide et convertit un identifiant en nombre entier positif.
 * @param {string} id - Identifiant sous forme de chaîne de caractères.
 * @returns {number | null} Identifiant numérique valide ou null en cas d'invalidité.
 */
export const validateId = (id: string): number | null => {
  const parsedId = parseInt(id)
  return !isNaN(parsedId) && parsedId > 0 ? parsedId : null
}
