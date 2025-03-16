import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    // Récupérer la catégorie et ses produits associés
    const category = await prisma.categorie.findUnique({
      where: { id_categorie: Number(params.id) },
      include: { produits: true }, // On inclut les produits associés
    })

    if (!category) {
      return NextResponse.json({ message: "Catégorie non trouvée" }, { status: 404 })
    }

    return new NextResponse(JSON.stringify(category), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
