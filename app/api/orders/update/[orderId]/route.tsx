import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;
  const { subscriptionType, subscriptionDuration } = await request.json();

  try {
    // Mettre à jour les informations d'abonnement
    const updatedOrder = await prisma.order.update({
      where: { id_order: Number(orderId) },
      data: {
        subscription_type: subscriptionType,
        subscription_duration: subscriptionDuration,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour de l'abonnement." }, { status: 500 });
  }
}
