import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import cartService from "@/lib/services/cartService";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("GET /api/cart - Session NextAuth:", session);

    if (!session || !session.user || !session.user.id) {
      let sessionToken = request.cookies.get("session_token")?.value;
      console.log("GET /api/cart - Session token (anonyme):", sessionToken);

      let anonSession = sessionToken
        ? await prisma.session.findUnique({ where: { session_token: sessionToken } })
        : null;
      console.log("GET /api/cart - Session anonyme récupérée:", anonSession);

      if (!anonSession || anonSession.expires_at < new Date()) {
        sessionToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        anonSession = await prisma.session.create({
          data: {
            session_token: sessionToken,
            expires_at: expiresAt,
            id_user: null, // Session anonyme, pas d'utilisateur
          },
        });
        console.log("GET /api/cart - Nouvelle session anonyme créée:", anonSession);
      }

      if (!anonSession.id_session) {
        throw new Error("ID de session anonyme manquant");
      }

      const cartItems = await cartService.getCartItems(anonSession.id_session);
      console.log("GET /api/cart - Éléments du panier (anonyme):", cartItems);

      const response = NextResponse.json(cartItems, { status: 200 });
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
    console.log("GET /api/cart - Utilisateur connecté, userId:", userId);

    let userSession = await prisma.session.findFirst({
      where: {
        id_user: userId,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: "desc" },
    });
    console.log("GET /api/cart - Session utilisateur récupérée:", userSession);

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
      console.log("GET /api/cart - Nouvelle session utilisateur créée:", userSession);
    } else {
      const timeToExpiration = userSession.expires_at.getTime() - new Date().getTime();
      if (timeToExpiration < 24 * 60 * 60 * 1000) {
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        userSession = await prisma.session.update({
          where: { id_session: userSession.id_session },
          data: { expires_at: newExpiresAt },
        });
        console.log("GET /api/cart - Session utilisateur mise à jour:", userSession);
      }
    }

    if (!userSession.id_session) {
      throw new Error("ID de session utilisateur manquant");
    }

    const cartItems = await cartService.getCartItems(userSession.id_session);
    console.log("GET /api/cart - Éléments du panier (utilisateur):", cartItems);
    return NextResponse.json(cartItems, { status: 200 });
  } catch (error) {
    console.error("GET /api/cart - Erreur lors de la récupération du panier:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("POST /api/cart - Session NextAuth:", session);

    const { productId, quantity, subscriptionType } = await request.json();
    console.log("POST /api/cart - Données reçues:", { productId, quantity, subscriptionType });

    // Vérifier la disponibilité du produit avant d'ajouter
    const product = await prisma.product.findUnique({
      where: { id_product: parseInt(productId, 10) },
      select: {
        id_product: true,
        available_quantity: true,
      },
    });

    if (!product) {
      throw new Error("Produit non trouvé");
    }

    if (quantity > product.available_quantity) {
      throw new Error(
        `Quantité demandée (${quantity}) dépasse le stock disponible (${product.available_quantity})`
      );
    }

    if (!session || !session.user || !session.user.id) {
      let sessionToken = request.cookies.get("session_token")?.value;
      console.log("POST /api/cart - Session token (anonyme):", sessionToken);

      let anonSession = sessionToken
        ? await prisma.session.findUnique({ where: { session_token: sessionToken } })
        : null;
      console.log("POST /api/cart - Session anonyme récupérée:", anonSession);

      if (!anonSession || anonSession.expires_at < new Date()) {
        sessionToken = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        anonSession = await prisma.session.create({
          data: {
            session_token: sessionToken,
            expires_at: expiresAt,
            id_user: null, // Session anonyme
          },
        });
        console.log("POST /api/cart - Nouvelle session anonyme créée:", anonSession);
      }

      if (!anonSession.id_session) {
        throw new Error("ID de session anonyme manquant");
      }

      const cartItem = await cartService.addToCart(
        anonSession.id_session,
        parseInt(productId, 10),
        quantity,
        subscriptionType
      );
      console.log("POST /api/cart - Élément ajouté au panier (anonyme):", cartItem);

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
    console.log("POST /api/cart - Utilisateur connecté, userId:", userId);

    let userSession = await prisma.session.findFirst({
      where: {
        id_user: userId,
        expires_at: { gt: new Date() },
      },
      orderBy: { created_at: "desc" },
    });
    console.log("POST /api/cart - Session utilisateur récupérée:", userSession);

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
      console.log("POST /api/cart - Nouvelle session utilisateur créée:", userSession);
    } else {
      const timeToExpiration = userSession.expires_at.getTime() - new Date().getTime();
      if (timeToExpiration < 24 * 60 * 60 * 1000) {
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        userSession = await prisma.session.update({
          where: { id_session: userSession.id_session },
          data: { expires_at: newExpiresAt },
        });
        console.log("POST /api/cart - Session utilisateur mise à jour:", userSession);
      }
    }

    if (!userSession.id_session) {
      throw new Error("ID de session utilisateur manquant");
    }

    const cartItem = await cartService.addToCart(
      userSession.id_session,
      parseInt(productId, 10),
      quantity,
      subscriptionType
    );
    console.log("POST /api/cart - Élément ajouté au panier (utilisateur):", cartItem);
    return NextResponse.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("POST /api/cart - Erreur lors de l'ajout au panier:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}