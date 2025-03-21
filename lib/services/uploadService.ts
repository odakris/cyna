/**
 * Upload un fichier image
 * @param file Fichier à uploader
 * @returns Chemin du fichier uploadé
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!file) throw new Error("Aucun fichier fourni")

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Erreur lors de l'upload de l'image")
  }

  const data = await response.json()
  return data.filePath
}
