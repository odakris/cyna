import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import type { NextRequest } from "next/server"
import { productFormSchema } from "@/lib/validations/productSchema"

// Validation du corps de la requête pour POST
const productSchema = productFormSchema

// Fonction pour récupérer tous les produits
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { id_category: true, name: true }, // Limite les champs de la catégorie
        },
      },
      orderBy: { priority_order: "asc" },
    })

    // console.log(
    //   "Products:",
    //   products.map(product => product.id_product)
    // )
    return NextResponse.json(products)
  } catch (error) {
    console.error("Erreur GET products:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Fonction pour ajouter un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = productSchema.parse(body) // Validation avec zod

    const newProduct = await prisma.product.create({
      data: {
        name: data.name.trim(),
        unit_price: data.unit_price,
        description: data.description.trim(),
        technical_specs: data.technical_specs.trim(),
        available: true,
        priority_order: data.priority_order,
        updated_at: new Date(),
        created_at: new Date(),
        stock: data.stock,
        image: data.image, // Stockage du nom de l'image
        category: { connect: { id_category: data.id_category } },
      },
    })

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Erreur POST product:", error)
    const message =
      error instanceof Error
        ? "Une erreur interne s'est produite."
        : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// Fonction pour supprimer un produit
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const idSchema = z.object({
      id: z.coerce
        .number()
        .int()
        .positive("L'ID du produit doit être un entier positif."),
    })

    const { id } = idSchema.parse(body) // Validation de l'ID du produit
    console.log("ID du produit à supprimer:", id)

    // Vérifier si le produit existe avant de le supprimer
    const existingProduct = await prisma.product.findUniqueOrThrow({
      where: { id_product: id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { message: "Produit introuvable" },
        { status: 404 }
      )
    }

    await prisma.product.delete({ where: { id_product: id } })

    return NextResponse.json({ message: "Produit supprimé avec succès" })
  } catch (error) {
    console.error("Erreur DELETE product:", error)
    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
