// /api/cart/add (route.ts)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import cartService from "@/lib/services/cartService";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("POST /api/cart/add - Session NextAuth:", session);

    const { id_product, quantity, subscription_type } = await request.json();
    console.log("Données reçues dans /api/cart/add:", { id_product, quantity, subscription_type });

    if (!session || !session.user || !session.user.id) {
      let sessionToken = request.cookies.get("session_token")?.value;
      console.log("POST /api/cart/add - Session token (anonyme):", sessionToken);

      let anonSession = sessionToken
        ? await prisma.session.findUnique({ where: { session_token: sessionToken } })
        : null;
      console.log("POST /api/cart/add - Session anonyme récupérée:", anonSession);

      if (!anonSession || anonSession.expires_at < new Date()) {
        sessionToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        anonSession = await prisma.session.create({
          data: {
            session_token: sessionToken,
            expires_at: expiresAt,
            id_user: null,
          },
        });
        console.log("POST /api/cart/add - Nouvelle session anonyme créée:", anonSession);
      }

      if (!anonSession.id_session) {
        throw new Error("ID de session anonyme manquant");
      }

      const cartItem = await cartService.addToCart(
        anonSession.id_session,
        id_product,
        quantity,
        subscription_type
      );
      console.log("POST /api/cart/add - Élément ajouté au panier (anonyme):", cartItem);

      const response = NextResponse.json(cartItem, { status: 201 });
      response.cookies.set("session_token", anonSession.session_token, {
        httpOnly: true,
        expires: anonSession.expires_at,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return response;
    }

    const userId = parseInt(session.user.id, 10);
    console.log("POST /api/cart/add - Utilisateur connecté, userId:", userId);

    let userSession = await prisma.session.findFirst({
      where: {
        id_user: userId,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: "desc" },
    });
    console.log("POST /api/cart/add - Session utilisateur récupérée:", userSession);

    if (!userSession) {
      const sessionToken = uuidv4();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      userSession = await prisma.session.create({
        data: {
          id_user: userId,
          session_token: sessionToken,
          expires_at: expiresAt,
        },
      });
      console.log("POST /api/cart/add - Nouvelle session utilisateur créée:", userSession);
    } else {
      const timeToExpiration = userSession.expires_at.getTime() - new Date().getTime();
      if (timeToExpiration < 24 * 60 * 60 * 1000) {
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        userSession = await prisma.session.update({
          where: { id_session: userSession.id_session },
          data: { expires_at: newExpiresAt },
        });
        console.log("POST /api/cart/add - Session utilisateur mise à jour:", userSession);
      }
    }

    if (!userSession.id_session) {
      throw new Error("ID de session utilisateur manquant");
    }

    const cartItem = await cartService.addToCart(
      userSession.id_session,
      id_product,
      quantity,
      subscription_type
    );
    console.log("POST /api/cart/add - Élément ajouté au panier (utilisateur):", cartItem);
    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error) || "Une erreur inconnue est survenue";
    console.error("POST /api/cart/add - Erreur lors de l'ajout au panier:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}