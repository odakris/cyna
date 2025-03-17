import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id // params is already resolved by Next.js
    const category = await prisma.category.findUnique({
      where: { id_category: Number(id) }, // Convert string to number
      include: { products: true }, // Include related products
    })

    if (!category) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(category, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  } finally {
    await prisma.$disconnect() // Ensure Prisma disconnects after the request
  }
}
