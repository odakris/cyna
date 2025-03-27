import { NextRequest, NextResponse } from "next/server";
import cartService from "@/lib/services/cartService";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionToken = request.cookies.get("next-auth.session-token")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Session non trouvée" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { session_token: sessionToken },
    });

    if (!session) {
      return NextResponse.json({ error: "Session invalide" }, { status: 400 });
    }

    await cartService.clearCart(session.id_session);
    return NextResponse.json({ message: "Panier vidé" }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors du vidage du panier:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}