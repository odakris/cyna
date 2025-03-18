import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // params est une promesse
) {
  try {
    const resolvedParams = await params // Résoudre la promesse
    const id = parseInt(resolvedParams.id)
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id_product: id },
      include: { category: true },
    })

    if (product) {
      const imageUrl = `/images/${product.image || "default_image.jpg"}`
      // console.log("URL de l'image récupérée pour le produit:", imageUrl)
      return NextResponse.json({ ...product, imageUrl }, { status: 200 })
    } else {
      return NextResponse.json(
        { message: "Produit non trouvé" },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error("Erreur lors de la recherche du produit:", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = parseInt(resolvedParams.id)
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 })
    }

    const body = await request.json()
    if (!body) {
      return NextResponse.json(
        { message: "Corps de la requête manquant" },
        { status: 400 }
      )
    }

    const updatedProduct = await prisma.product.update({
      where: { id_product: id },
      data: {
        name: body.name?.trim(),
        unit_price: Number(body.unit_price),
        description: body.description?.trim(),
        technical_specs: body.technical_specs?.trim(),
        available: body.available,
        priority_order: body.priority_order,
        last_updated: new Date(),
        id_category: body.id_category,
        image: body.image,
        stock: body.stock !== undefined ? Math.max(0, body.stock) : undefined,
      },
    })

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error) {
    console.error("Erreur PUT product:", error)
    return NextResponse.json(
      { message: (error as Error).message || "Erreur serveur" },
      { status: error instanceof Error ? 400 : 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
