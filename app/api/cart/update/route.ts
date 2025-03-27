// /api/cart/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import cartService from "@/lib/services/cartService";

export async function PUT(request: NextRequest) {
  try {
    const { id, quantity, subscriptionType } = await request.json();

    const cartItem = await cartService.updateCartItem(id, quantity, subscriptionType);
    return NextResponse.json(cartItem, { status: 200 });
  } catch (error) {
    console.error("PUT /api/cart/update - Erreur:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}