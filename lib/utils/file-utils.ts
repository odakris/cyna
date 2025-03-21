export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]

/**
 * Valide le type de fichier
 * @param file Fichier à valider
 * @returns Message d'erreur ou null si valide
 */
export function validateFileType(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return "Type de fichier non autorisé. Formats acceptés: JPG, PNG, WEBP"
  }
  return null
}

/**
 * Valide la taille du fichier
 * @param buffer Buffer du fichier
 * @returns Message d'erreur ou null si valide
 */
export function validateFileSize(buffer: Buffer): string | null {
  if (buffer.length > MAX_FILE_SIZE) {
    return `Fichier trop volumineux. Taille maximum: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
  }
  return null
}
