import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;

  try {
    // Marquer la commande comme annulée
    const canceledOrder = await prisma.order.update({
      where: { id_order: Number(orderId) },
      data: {
        order_status: "Annulé",
      },
    });

    return NextResponse.json(canceledOrder);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la résiliation de l'abonnement." }, { status: 500 });
  }
}
