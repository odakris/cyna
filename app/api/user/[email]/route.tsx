// app/api/user/[email]/route.tsx

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: { email: string } }) {
  // Attendre les params de manière asynchrone
  const { email } = await params;

  try {
    const client = await prisma.client.findUnique({
      where: { email },
      select: {
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la récupération des données" }, { status: 500 });
  }
}
