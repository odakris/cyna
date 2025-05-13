import { NextRequest, NextResponse } from "next/server";
import orderController from "@/lib/controllers/order-controller";
import { checkPermission } from "@/lib/api-permissions";

export async function GET(): Promise<NextResponse> {
  try {
    const permissionCheck = await checkPermission("orders:view");
    if (permissionCheck) return permissionCheck;

    return await orderController.getAll();
  } catch (error) {
    /* console.error(
      "[API Orders] Erreur non gérée lors de la récupération des commandes:",
      error
    );*/
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur inattendue",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const userId = request.headers.get("x-user-id");
    const guestId = request.headers.get("x-guest-id");

    console.log("[API Orders] Requête reçue", {
      userId,
      guestId,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });

    if (!userId && !guestId) {
      // console.error("[API Orders] Aucun identifiant fourni");
      return NextResponse.json(
        {
          success: false,
          error: "Authentification requise",
          details: "x-user-id ou x-guest-id manquant",
        },
        { status: 401 }
      );
    }

    if (userId) {
      console.log("[API Orders] Vérification des permissions pour orders:create", { userId });
      const permissionCheck = await checkPermission("orders:create");

      if (permissionCheck) {
        /*console.error("[API Orders] Échec de la vérification des permissions", {
          userId,
          status: permissionCheck.status,
          response: await permissionCheck.json().catch(() => ({
            error: "Impossible de parser la réponse",
          })),
        });*/
        return permissionCheck;
      }
    }

    let body;
    try {
      body = await request.json();
      console.log("[API Orders] Corps de la requête brut", JSON.stringify(body, null, 2));
    } catch (error) {
      // console.error("[API Orders] Erreur lors de la lecture du corps de la requête", error);
      return NextResponse.json(
        {
          success: false,
          error: "Corps de la requête invalide",
          details: "Impossible de parser le JSON",
        },
        { status: 400 }
      );
    }

    const {
      cartItems,
      addressId,
      paymentId,
      paymentIntentId,
      guestId: bodyGuestId,
    } = body;

    const finalGuestId = guestId || bodyGuestId;

    console.log("[API Orders] Données extraites", {
      cartItems: cartItems?.length,
      addressId,
      paymentId,
      paymentIntentId,
      finalGuestId,
    });

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "cartItems doit être un tableau non vide",
        },
        { status: 400 }
      );
    }

    if (!addressId || typeof addressId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "addressId est requis et doit être une chaîne",
        },
        { status: 400 }
      );
    }

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "paymentIntentId est requis et doit être une chaîne",
        },
        { status: 400 }
      );
    }

    if (!paymentId || typeof paymentId !== "string") {
      if (userId) {
        return NextResponse.json(
          {
            success: false,
            error: "Données invalides",
            details: "paymentId est requis pour les utilisateurs connectés",
          },
          { status: 400 }
        );
      } else {
        console.warn("[API Orders] Utilisateur invité sans paymentId. Accepté.");
      }
    }

    const data = { cartItems, addressId, paymentId, paymentIntentId };

    console.log("[API Orders] Données envoyées à orderController.create :", JSON.stringify(data, null, 2));

    const orderResponse = await orderController.create(data, userId, finalGuestId);

    console.log("[API Orders] Commande créée avec succès", {
      orderId: orderResponse?.json?.id_order,
      userId,
      guestId: finalGuestId,
    });

    return orderResponse;
  } catch (error) {
    // console.error("[API Orders] Erreur non gérée lors de la création de la commande:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur inattendue",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
