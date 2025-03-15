import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import type { Produit, Categorie } from "@prisma/client";

// Définir une interface pour un produit avec sa catégorie
interface ProduitWithCategorie extends Produit {
  categorie: Categorie;
}

// Méthode GET
export async function GET(): Promise<NextResponse<ProduitWithCategorie[] | { error: string }>> {
  try {
    const products = await prisma.produit.findMany({
      include: { categorie: true },
    });
    console.log("Produits renvoyés:", products);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Erreur GET products:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Méthode POST
export async function POST(
  request: NextRequest
): Promise<NextResponse<Produit | { error: string }>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      throw new Error("Le corps de la requête est invalide ou vide");
    }

    const data = body as Partial<Produit>;
    const newProduct = await prisma.produit.create({
      data: {
        nom: data.nom || "",
        prix_unitaire: data.prix_unitaire || 0,
        description: data.description || null,
        caracteristiques_techniques: data.caracteristiques_techniques || null,
        disponible: data.disponible ?? true,
        ordre_priorite: data.ordre_priorite || 1,
        date_maj: data.date_maj || new Date(),
        id_categorie: data.id_categorie || 1,
        image: data.image || null,
      },
    });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Erreur POST product:", error);
    return NextResponse.json({ error: (error as Error).message || "Erreur serveur" }, { status: 500 });
  }
}

// Méthode PUT
export async function PUT(
  request: NextRequest
): Promise<NextResponse<Produit | { error: string }>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      throw new Error("Le corps de la requête est invalide ou null");
    }

    const data = body as Partial<Produit> & { id_produit: number };
    if (typeof data.id_produit !== "number") {
      throw new Error("L'ID du produit doit être un nombre");
    }

    const updatedProduct = await prisma.produit.update({
      where: { id_produit: data.id_produit },
      data: {
        nom: data.nom || undefined,
        prix_unitaire: data.prix_unitaire || undefined,
        description: data.description || undefined,
        caracteristiques_techniques: data.caracteristiques_techniques || undefined,
        disponible: data.disponible || undefined,
        ordre_priorite: data.ordre_priorite || undefined,
        date_maj: data.date_maj || new Date(),
        id_categorie: data.id_categorie || undefined,
        image: data.image || undefined,
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erreur PUT product:", error);
    return NextResponse.json({ error: (error as Error).message || "Erreur serveur" }, { status: 400 });
  }
}

// Méthode DELETE
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || !body.id) {
      throw new Error("L'ID du produit est requis");
    }

    const { id } = body as { id: number };
    if (typeof id !== "number") {
      throw new Error("L'ID doit être un nombre");
    }

    await prisma.produit.delete({
      where: { id_produit: id },
    });
    return NextResponse.json({ message: "Produit supprimé" });
  } catch (error) {
    console.error("Erreur DELETE product:", error);
    return NextResponse.json({ error: (error as Error).message || "Erreur serveur" }, { status: 500 });
  }
}