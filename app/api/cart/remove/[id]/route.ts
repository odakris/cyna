// /api/cart/remove/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cartService from "@/lib/services/cartService";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10);
    await cartService.removeFromCart(id);
    return NextResponse.json({ message: "Élément supprimé" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/cart/remove - Erreur:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}