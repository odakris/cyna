import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import cartService from "@/lib/services/cartService";
import { SubscriptionType } from "@prisma/client";

// Schéma de validation pour l'ajout et la mise à jour d'un élément dans le panier
const addToCartSchema = z.object({
  id_product: z.number().int().positive("L'ID du produit doit être un entier positif"),
  quantity: z.number().int().positive("La quantité doit être un entier positif"),
  subscriptionType: z.enum(["MONTHLY", "YEARLY", "PER_USER", "PER_MACHINE"], {
    errorMap: () => ({ message: "Type d'abonnement invalide" }),
  }),
});

const updateCartItemSchema = z.object({
  cartItemId: z.number().int().positive("L'ID de l'élément du panier doit être un entier positif"),
  quantity: z.number().int().positive("La quantité doit être un entier positif"),
  subscriptionType: z.enum(["MONTHLY", "YEARLY", "PER_USER", "PER_MACHINE"], {
    errorMap: () => ({ message: "Type d'abonnement invalide" }),
  }),
});

const removeFromCartSchema = z.object({
  cartItemId: z.number().int().positive("L'ID de l'élément du panier doit être un entier positif"),
});

// Récupérer le panier (GET /api/cart)
export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("next-auth.session-token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Session non trouvée" }, { status: 401 });
    }

    const session = await cartService.getSessionByToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const cartItems = await cartService.getCartItems(session.id_session);
    return NextResponse.json(cartItems, { status: 200 });
  } catch (error) {
    // console.error("Erreur lors de la récupération du panier:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Ajouter un élément au panier (POST /api/cart)
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("next-auth.session-token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Session non trouvée" }, { status: 401 });
    }

    const session = await cartService.getSessionByToken(sessionToken);
    if (!session) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const body = await request.json();
    const result = addToCartSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.format() },
        { status: 400 }
      );
    }

    const { id_product, quantity, subscriptionType } = result.data;

    const cartItem = await cartService.addToCart(
      session.id_session,
      id_product,
      quantity,
      subscriptionType as SubscriptionType
    );
    return NextResponse.json(cartItem, { status: 200 });
  } catch (error) {
    // console.error("Erreur lors de l'ajout au panier:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Mettre à jour un élément du panier (PUT /api/cart)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const result = updateCartItemSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.format() },
        { status: 400 }
      );
    }

    const { cartItemId, quantity, subscriptionType } = result.data;

    const updatedItem = await cartService.updateCartItem(
      cartItemId,
      quantity,
      subscriptionType as SubscriptionType
    );
    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    // console.error("Erreur lors de la mise à jour du panier:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Supprimer un élément du panier (DELETE /api/cart)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const result = removeFromCartSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides", details: result.error.format() },
        { status: 400 }
      );
    }

    const { cartItemId } = result.data;

    await cartService.removeFromCart(cartItemId);
    return NextResponse.json({ message: "Élément supprimé du panier" }, { status: 200 });
  } catch (error) {
    // console.error("Erreur lors de la suppression du panier:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}