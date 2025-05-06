import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req: Request) {
  try {
    console.log("[Auth SignOut] Requête de déconnexion reçue");

    // Vérifier la session actuelle
    const session = await getServerSession(authOptions);
    console.log("[Auth SignOut] Session avant déconnexion:", {
      sessionExists: !!session,
      userId: session?.user?.id_user,
    });

    // Créer une réponse JSON
    const response = NextResponse.json(
      { message: "Déconnexion réussie", url: "/auth" },
      { status: 200 }
    );

    // Supprimer explicitement le cookie de session
    response.cookies.set("next-auth.session-token", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log("[Auth SignOut] Cookie de session supprimé");
    return response;
  } catch (error: any) {
    console.error("[Auth SignOut] Erreur lors de la déconnexion", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}