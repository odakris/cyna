import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Utilitaire pour valider l'ID
const validateId = (id: string) => {
  const parsedId = parseInt(id)
  return !isNaN(parsedId) && parsedId > 0 ? parsedId : null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 })
    }

    const category = await prisma.category.findUnique({
      where: { id_category: id },
      include: { products: true },
    })

    if (!category) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la recherche de la catégorie:", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
