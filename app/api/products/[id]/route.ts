import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { productFormSchema } from "@/lib/validations/productSchema"

const prisma = new PrismaClient()

// Utilitaire pour valider l'ID
const validateId = (id: string) => {
  const parsedId = parseInt(id)
  return !isNaN(parsedId) && parsedId > 0 ? parsedId : null
}

// Validation du corps de la requête pour PUT
const productSchema = productFormSchema

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

    console.log("ID du produit à récupérer:", id)

    const product = await prisma.product.findUnique({
      where: { id_product: id },
      include: { category: true },
    })

    if (!product) {
      return NextResponse.json(
        { message: "Produit non trouvé" },
        { status: 404 }
      )
    }

    const imageUrl = `${product.image || "default_image.jpg"}`
    return NextResponse.json({ ...product, imageUrl }, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la recherche du produit:", error)
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json({ message: "ID invalide" }, { status: 400 })
    }

    const body = await request.json()

    // Validation des données avec Zod
    const parsedData = productSchema.safeParse(body)

    if (!parsedData.success) {
      return NextResponse.json(
        { message: parsedData.error.format() },
        { status: 400 }
      )
    }

    const updatedProduct = await prisma.product.update({
      where: { id_product: id },
      data: {
        name: parsedData.data.name.trim(),
        unit_price: parsedData.data.unit_price,
        description: parsedData.data.description.trim(),
        technical_specs: parsedData.data.technical_specs.trim(),
        available: parsedData.data.available,
        priority_order: parsedData.data.priority_order,
        updated_at: new Date(),
        id_category: parsedData.data.id_category,
        image: parsedData.data.image,
        stock: Math.max(0, parsedData.data.stock),
      },
    })

    return NextResponse.json(updatedProduct, { status: 200 })
  } catch (error) {
    console.error("Erreur PUT product:", error)
    return NextResponse.json(
      { message: (error as Error).message || "Erreur serveur" },
      { status: error instanceof Error ? 400 : 500 }
    )
  }
}
