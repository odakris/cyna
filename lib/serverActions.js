import { PrismaClient } from "@prisma/client"

// Instancier PrismaClient dans ce fichier
const prisma = new PrismaClient()

// Fonction pour récupérer les produits selon les critères de recherche
export async function getFilteredProducts(criteria) {
  const {
    title,
    description,
    features,
    minPrice,
    maxPrice,
    categories,
    onlyAvailable,
  } = criteria

  const filterConditions = {}

  // Appliquer les critères de filtre en fonction de la recherche
  if (title) filterConditions.nom = { contains: title, mode: "insensitive" }
  if (description)
    filterConditions.description = {
      contains: description,
      mode: "insensitive",
    }
  if (features)
    filterConditions.caracteristiques_techniques = {
      contains: features,
      mode: "insensitive",
    }
  if (minPrice) filterConditions.prix_unitaire = { gte: minPrice }
  if (maxPrice) filterConditions.prix_unitaire = { lte: maxPrice }
  if (categories && categories.length > 0)
    filterConditions.id_categorie = { in: categories }
  if (onlyAvailable) filterConditions.disponible = true

  // Exécuter la requête Prisma pour obtenir les produits
  const products = await prisma.produit.findMany({
    where: filterConditions,
    include: { categorie: true }, // Inclure les informations sur la catégorie
  })

  return products
}
