import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"
import type { Product, Category } from "@prisma/client"

interface ProductWithCategory extends Product {
  category: Category
}

const validateProductData = (data: unknown): Partial<Product> => {
  if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
    throw new Error("Les données du produit sont invalides ou absentes")
  }
  return data as Partial<Product>
}

const validateProductId = (id: unknown): number => {
  if (id === undefined || id === null) {
    throw new Error("L'ID du produit est requis")
  }
  const parsedId = Number(id)
  if (isNaN(parsedId) || !Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error("L'ID du produit doit être un nombre entier positif")
  }
  return parsedId
}

export async function GET(): Promise<
  NextResponse<ProductWithCategory[] | { error: string }>
> {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { priority_order: "asc" },
    })
    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur GET products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<Product | { error: string }>> {
  try {
    const body = await request.json()
    const data = validateProductData(body)

    const newProduct = await prisma.product.create({
      data: {
        name: data.name?.trim() || "",
        unit_price: Number(data.unit_price) || 0,
        description: data.description?.trim() || null,
        technical_specs: data.technical_specs?.trim() || null,
        available: data.available ?? true,
        priority_order: data.priority_order || 1,
        last_updated: new Date(),
        id_category: data.id_category || 1,
        image: data.image || null,
        stock: Math.max(0, data.stock || 0),
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Erreur POST product:", error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const body = await request.json()
    const id = validateProductId(body.id)

    await prisma.product.delete({
      where: { id_product: id },
    })

    return NextResponse.json({ message: "Produit supprimé avec succès" })
  } catch (error) {
    console.error("Erreur DELETE product:", error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
