import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request, { params }: { params: { orderId: string } }) {
  const { orderId } = params;

  try {
    // Mettre à jour la date de renouvellement de la commande
    const order = await prisma.order.update({
      where: { id_order: Number(orderId) },
      data: {
        renewal_date: new Date(),
        order_status: "Renouvelé", // Marquer la commande comme renouvelée
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors du renouvellement de l'abonnement." }, { status: 500 });
  }
}
