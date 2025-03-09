import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const allProducts = await prisma.produit.findMany({
      include: { categorie: true },
    })

    return new NextResponse(JSON.stringify(allProducts ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la recherche des produit :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
