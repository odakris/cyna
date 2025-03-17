import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Récupérer l'ID du produit
    const id = parseInt(params.id)

    // Récupérer le produit correspondant à l'ID
    const product = await prisma.product.findUnique({
      where: { id_product: id },
      include: { category: true },
    })

    // Si le produit existe, on prépare l'URL de l'image
    if (product) {
      // Construction du chemin d'accès à l'image stockée dans public/images/
      const imageUrl = `/images/${product.image}`
      console.log("URL de l'image récupérée pour le produit : ", imageUrl)

      // Renvoi du produit avec l'URL de l'image
      return new NextResponse(
        JSON.stringify({
          ...product,
          imageUrl,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    } else {
      return new NextResponse(
        JSON.stringify({ message: "Produit non trouvé" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
  } catch (error) {
    console.error("Erreur lors de la recherche du produit :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
