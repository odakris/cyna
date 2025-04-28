import { NextRequest, NextResponse } from "next/server"
import { Prisma, PrismaClient } from "@prisma/client"
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

    // Construire l'objet where pour la requête Prisma
    // Approche sans tableau de conditions, en utilisant un objet complet
    const whereClause: Prisma.ProductWhereInput = {
      unit_price: {
        gte: minPrice,
        lte: maxPrice,
      },
    }

    // Ajouter les conditions textuelles si présentes
    if (title) {
      whereClause.OR = [
        { name: { equals: title } },
        { name: { contains: title } },
        { name: { startsWith: title } },
      ]
    }

    if (description) {
      // Si title est aussi défini, nous devons combiner avec AND
      if (title) {
        whereClause.AND = [
          {
            OR: [
              { description: { equals: description } },
              { description: { contains: description } },
              { description: { startsWith: description } },
            ],
          },
        ]
      } else {
        whereClause.OR = [
          { description: { equals: description } },
          { description: { contains: description } },
          { description: { startsWith: description } },
        ]
      }
    }

    if (features) {
      // Si d'autres critères textuels sont définis, ajouter à AND
      if (whereClause.AND) {
        if (!Array.isArray(whereClause.AND)) {
          whereClause.AND = []
        }
        whereClause.AND.push({
          OR: [
            { technical_specs: { equals: features } },
            { technical_specs: { contains: features } },
            { technical_specs: { startsWith: features } },
          ],
        })
      } else if (title || description) {
        whereClause.AND = [
          {
            OR: [
              { technical_specs: { equals: features } },
              { technical_specs: { contains: features } },
              { technical_specs: { startsWith: features } },
            ],
          },
        ]
      } else {
        whereClause.OR = [
          { technical_specs: { equals: features } },
          { technical_specs: { contains: features } },
          { technical_specs: { startsWith: features } },
        ]
      }
    }

    // Ajouter les filtres booléens et numériques
    if (onlyAvailable) {
      whereClause.available = true
    }

    if (category) {
      whereClause.id_category = parseInt(category)
    }

    // Requête Prisma
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id_category: true, name: true },
        },
        product_caroussel_images: {
          select: { id_product_caroussel_image: true, url: true, alt: true },
        },
      },
    })

    // Trier les résultats selon les règles de priorité
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
