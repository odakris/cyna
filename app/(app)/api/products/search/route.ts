import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

    // Construire la requête Prisma avec les bons noms de colonnes
    const products = await prisma.product.findMany({
      where: {
        name: { contains: title },
        description: { contains: description },
        technical_specs: { contains: features },
        unit_price: { gte: minPrice, lte: maxPrice },
        available: onlyAvailable ? true : undefined,
        id_category: category ? parseInt(category) : undefined,
      },
    })

    return new NextResponse(JSON.stringify(products ?? []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la recherche des produits :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
