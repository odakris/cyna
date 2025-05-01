import { NextResponse } from "next/server";
import orderService from "@/lib/services/order-service";
import { orderInputSchema } from "@/lib/validations/order-schema";
import { z } from "zod";

async function create(data: any, userId?: string, guestId?: string) {
  console.log("[OrderController] Données reçues pour création de commande:", JSON.stringify(data, null, 2));

  try {
    if (!data || typeof data !== "object") {
      console.error("[OrderController] Données data invalides:", { data });
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "Les données de la commande doivent être un objet non vide",
        },
        { status: 400 }
      );
    }

    const payload = {
      ...data,
      id_user: userId && !isNaN(parseInt(userId)) ? parseInt(userId) : undefined,
      guestId: guestId || undefined,
    };

    console.log("[OrderController] Payload avant validation:", JSON.stringify(payload, null, 2));

    const validatedData = orderInputSchema.parse(payload);
    console.log("[OrderController] Données validées:", JSON.stringify(validatedData, null, 2));

    const order = await orderService.create(validatedData);
    console.log("[OrderController] Commande créée:", JSON.stringify(order, null, 2));

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("[OrderController] Erreur lors de la création de la commande:", error);
    if (error instanceof z.ZodError) {
      console.log("[OrderController] Détails des erreurs Zod:", JSON.stringify(error.errors, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la création de la commande",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export default { create };
