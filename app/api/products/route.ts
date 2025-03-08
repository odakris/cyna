// /app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import type { Produit, Categorie } from "@prisma/client";

interface ProduitWithCategorie extends Produit {
  categorie: Categorie;
}

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

export async function POST(request: NextRequest): Promise<NextResponse<Produit | { error: string }>> {
  try {
    const data = (await request.json()) as Partial<Produit>;
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
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest): Promise<NextResponse<Produit | { error: string }>> {
  try {
    const data = (await request.json()) as Partial<Produit> & { id_produit: number };
    const updatedProduct = await prisma.produit.update({
      where: { id_produit: data.id_produit },
      data: {
        nom: data.nom,
        prix_unitaire: data.prix_unitaire,
        description: data.description,
        caracteristiques_techniques: data.caracteristiques_techniques,
        disponible: data.disponible,
        ordre_priorite: data.ordre_priorite,
        date_maj: data.date_maj || new Date(),
        id_categorie: data.id_categorie,
        image: data.image,
      },
    });
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erreur PUT product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse<{ message: string } | { error: string }>> {
  try {
    const { id } = (await request.json()) as { id: number };
    await prisma.produit.delete({
      where: { id_produit: id },
    });
    return NextResponse.json({ message: "Produit supprimé" });
  } catch (error) {
    console.error("Erreur DELETE product:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}