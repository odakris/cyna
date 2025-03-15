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
    const product = await prisma.produit.findUnique({
      where: { id_produit: id },
      include: { categorie: true },
    })

    return new NextResponse(JSON.stringify(product ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la recherche du produit :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
