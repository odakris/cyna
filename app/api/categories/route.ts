import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const categories = await prisma.category.findMany({})

    return new NextResponse(JSON.stringify(categories ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Erreur lors de la recherche des categories :", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}
