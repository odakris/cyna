import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Types pour les résultats des requêtes SQL brutes
type ProductSearchRawResult = {
  id_product: number
  name: string
  description: string
  main_image: string
  category_name: string | null
}

type CategorySearchRawResult = {
  id_category: number
  name: string
  description: string
  image: string
}

// Types pour la réponse formatée
type ProductSearchResult = {
  id_product: number
  name: string
  description: string
  main_image: string
  category: { name: string } | null
}

type SearchApiResponse = {
  products: ProductSearchResult[]
  categories: CategorySearchRawResult[]
}

/**
 * API de recherche rapide pour produits et catégories
 *
 * @param {NextRequest} request - La requête entrante avec le paramètre query
 * @returns {NextResponse} Résultats de recherche pour produits et catégories correspondants
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<SearchApiResponse | { error: string }>> {
  try {
    const { searchParams } = request.nextUrl
    const query = searchParams.get("query") || ""

    if (!query.trim()) {
      return NextResponse.json({ products: [], categories: [] })
    }

    // Pour MySQL, nous utilisons LOWER pour la recherche insensible à la casse
    // Nous utilisons une requête SQL brute pour la meilleure précision
    const products = await prisma.$queryRaw<ProductSearchRawResult[]>`
      SELECT 
        p.id_product, 
        p.name,
        p.description,
        p.main_image,
        c.name as category_name
      FROM 
        Product p
      LEFT JOIN 
        Category c ON p.id_category = c.id_category
      WHERE 
        (LOWER(p.name) LIKE CONCAT('%', LOWER(${query}), '%') 
        OR LOWER(p.description) LIKE CONCAT('%', LOWER(${query}), '%'))
        AND p.active = true
      ORDER BY 
        p.priority_order ASC
      LIMIT 5
    `

    // De même pour les catégories
    const categories = await prisma.$queryRaw<CategorySearchRawResult[]>`
      SELECT 
        id_category,
        name,
        description,
        image
      FROM 
        Category
      WHERE 
        (LOWER(name) LIKE CONCAT('%', LOWER(${query}), '%')
        OR LOWER(description) LIKE CONCAT('%', LOWER(${query}), '%'))
        AND active = true
      ORDER BY 
        priority_order ASC
      LIMIT 3
    `

    // Formater les résultats pour qu'ils correspondent à ce que notre hook attend
    const formattedProducts: ProductSearchResult[] = products.map(product => ({
      id_product: product.id_product,
      name: product.name,
      description: product.description,
      main_image: product.main_image,
      category: product.category_name ? { name: product.category_name } : null,
    }))

    return NextResponse.json({
      products: formattedProducts,
      categories: categories,
    })
  } catch (error) {
    console.error("Erreur lors de la recherche :", error)
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    )
  }
}
