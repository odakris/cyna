import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"
import type { Product, Category } from "@prisma/client"

// Définir une interface pour un produit avec sa catégorie
interface ProduitWithcategory extends Product {
  category: Category
}

// Méthode GET
export async function GET(): Promise<
  NextResponse<ProduitWithcategory[] | { error: string }>
> {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    })
    console.log("Produits renvoyés:", products)
    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur GET products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Méthode POST
export async function POST(
  request: NextRequest
): Promise<NextResponse<Product | { error: string }>> {
  try {
    const body = await request.json()
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      throw new Error("Le corps de la requête est invalide ou vide")
    }

    const data = body as Partial<Product>
    const newProduct = await prisma.produit.create({
      data: {
        nom: data.name || "",
        prix_unitaire: data.unit_price || 0,
        description: data.description || null,
        caracteristiques_techniques: data.technical_specs || null,
        disponible: data.available ?? true,
        ordre_priorite: data.unit_price || 1,
        date_maj: data.last_updated || new Date(),
        id_category: data.id_category || 1,
        image: data.image || null,
      },
    })
    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Erreur POST product:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Erreur serveur" },
      { status: 500 }
    )
  }
}

// Méthode PUT
export async function PUT(
  request: NextRequest
): Promise<NextResponse<Product | { error: string }>> {
  try {
    const body = await request.json()
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      throw new Error("Le corps de la requête est invalide ou null")
    }

    const data = body as Partial<Product> & { id_product: number }
    if (typeof data.id_product !== "number") {
      throw new Error("L'ID du produit doit être un nombre")
    }

    const updatedProduct = await prisma.produit.update({
      where: { id_product: data.id_product },
      data: {
        nom: data.name || undefined,
        prix_unitaire: data.unit_price || undefined,
        description: data.description || undefined,
        technical_specs: data.technical_specs || undefined,
        disponible: data.available || undefined,
        ordre_priorite: data.priority_order || undefined,
        date_maj: data.last_updated || new Date(),
        id_category: data.id_category || undefined,
        image: data.image || undefined,
      },
    })
    return NextResponse.json(updatedProduct)
  } catch (error) {
    console.error("Erreur PUT product:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Erreur serveur" },
      { status: 400 }
    )
  }
}

// Méthode DELETE
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const body = await request.json()
    if (!body || typeof body !== "object" || !body.id) {
      throw new Error("L'ID du produit est requis")
    }

    const { id } = body as { id: number }
    if (typeof id !== "number") {
      throw new Error("L'ID doit être un nombre")
    }

    await prisma.produit.delete({
      where: { id_product: id },
    })
    return NextResponse.json({ message: "Produit supprimé" })
  } catch (error) {
    console.error("Erreur DELETE product:", error)
    return NextResponse.json(
      { error: (error as Error).message || "Erreur serveur" },
      { status: 500 }
    )
  }
}
