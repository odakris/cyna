import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sortProductsBySearchPriority } from "@/lib/utils/search-utils"

const prisma = new PrismaClient()

/**
 * Gère les requêtes de recherche avancée des produits
 * Supporte les critères suivants:
 * - Texte du titre (query)
 * - Texte de la description
 * - Caractéristiques techniques (features)
 * - Prix minimum et maximum
 * - Catégorie
 * - Uniquement services disponibles
 *
 * @param {NextRequest} request - La requête entrante avec les paramètres de recherche
 * @returns {NextResponse} Les produits correspondant aux critères de recherche
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl

    // Récupérer les paramètres de recherche
    const title = searchParams.get("query") || ""
    const description = searchParams.get("description") || ""
    const features = searchParams.get("features") || ""
    const minPrice = parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "9999999")
    const onlyAvailable = searchParams.get("onlyAvailable") === "true"
    const category = searchParams.get("category")

    // Construire les conditions OR pour les recherches textuelles
    const titleConditions = title
      ? {
          OR: [
            { name: { equals: title } },
            { name: { contains: title } },
            { name: { startsWith: title } },
          ],
        }
      : {}

    const descriptionConditions = description
      ? {
          OR: [
            { description: { equals: description } },
            { description: { contains: description } },
            { description: { startsWith: description } },
          ],
        }
      : {}

    const featuresConditions = features
      ? {
          OR: [
            { technical_specs: { equals: features } },
            { technical_specs: { contains: features } },
            { technical_specs: { startsWith: features } },
          ],
        }
      : {}

    // Construction des conditions de recherche
    const conditions = [
      titleConditions,
      descriptionConditions,
      featuresConditions,
      { unit_price: { gte: minPrice, lte: maxPrice } },
    ]

    // Ajout conditionnel des autres filtres
    if (onlyAvailable) {
      conditions.push({ available: true })
    }

    if (category) {
      conditions.push({ id_category: parseInt(category) })
    }

    // Construire la requête Prisma avec les filtres
    const products = await prisma.product.findMany({
      where: {
        AND: conditions,
      },
      include: {
        category: {
          select: { id_category: true, name: true },
        },
        product_caroussel_images: {
          select: { id_product_caroussel_image: true, url: true, alt: true },
        },
      },
    })

    // Trier les résultats selon les règles de priorité définies dans le cahier des charges
    const sortedProducts = sortProductsBySearchPriority(
      products,
      title,
      description,
      features
    )

    // Retourner les résultats triés
    return new NextResponse(JSON.stringify(sortedProducts ?? []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la recherche des produits :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
