import { NextRequest, NextResponse } from "next/server";
import orderController from "@/lib/controllers/order-controller";
import { checkPermission } from "@/lib/api-permissions";

export async function GET(): Promise<NextResponse> {
  try {
    const permissionCheck = await checkPermission("orders:view");
    if (permissionCheck) return permissionCheck;

    return await orderController.getAll();
  } catch (error) {
    console.error(
      "[API Orders] Erreur non gérée lors de la récupération des commandes:",
      error
    );
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
      console.error("[API Orders] Aucun identifiant fourni");
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
      console.log("[API Orders] Résultat de checkPermission", { permissionCheck: permissionCheck?.status || "aucune réponse" });

      if (permissionCheck) {
        console.error("[API Orders] Échec de la vérification des permissions", {
          userId,
          status: permissionCheck.status,
          response: await permissionCheck.json().catch(() => ({ error: "Impossible de parser la réponse" })),
        });
        return permissionCheck;
      }
    }

    let body;
    try {
      body = await request.json();
      console.log("[API Orders] Corps de la requête brut", JSON.stringify(body, null, 2));
    } catch (error) {
      console.error("[API Orders] Erreur lors de la lecture du corps de la requête", error);
      return NextResponse.json(
        {
          success: false,
          error: "Corps de la requête invalide",
          details: "Impossible de parser le JSON",
        },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    const { cartItems, addressId, paymentId, paymentIntentId, guestId: bodyGuestId } = body;

    console.log("[API Orders] Données extraites", {
      cartItems: cartItems?.length,
      addressId,
      paymentId,
      paymentIntentId,
      bodyGuestId,
    });

    if (!body || typeof body !== "object") {
      console.error("[API Orders] Corps de la requête vide ou invalide", { body });
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "Le corps de la requête doit être un objet non vide",
        },
=======
    // Vérifier la session ou le mode invité
    if (!session?.user?.id_user && !guestUserId) {
      console.error('[API Checkout] Utilisateur non connecté et pas de guestUserId');
      return NextResponse.json(
        { error: 'Utilisateur non connecté ou guestUserId manquant' },
        { status: 401 }
      );
    }

    const userId = session?.user?.id_user || guestUserId;
    console.log('[API Checkout] UserId déterminé:', { userId });

    // Récupérer les informations de paiement
    console.log('[API Checkout] Récupération de PaymentInfo:', { paymentId, userId });
    const paymentInfo = await prisma.paymentInfo.findFirst({
      where: {
        id_payment_info: parseInt(paymentId),
        id_user: parseInt(userId),
      },
    });

    if (!paymentInfo || !paymentInfo.stripe_payment_id) {
      console.error('[API Checkout] Moyen de paiement non trouvé:', { paymentId, userId, paymentInfo });
      return NextResponse.json(
        { error: 'Moyen de paiement non trouvé ou invalide' },
        { status: 404 }
      );
    }
    console.log('[API Checkout] PaymentInfo récupéré:', { stripe_payment_id: paymentInfo.stripe_payment_id });

    // Vérifier que stripe_payment_id est un payment_method valide
    if (!paymentInfo.stripe_payment_id.startsWith('pm_')) {
      console.error('[API Checkout] stripe_payment_id invalide:', {
        stripe_payment_id: paymentInfo.stripe_payment_id,
      });
      return NextResponse.json(
        { error: 'Identifiant de paiement Stripe invalide' },
>>>>>>> parent of 35a2ac8 (checkout fonctionnel avec facture)
        { status: 400 }
      );
    }

<<<<<<< HEAD
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      console.error("[API Orders] Données cartItems invalides", { cartItems });
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
      console.error("[API Orders] addressId invalide", { addressId });
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "addressId est requis et doit être une chaîne",
        },
        { status: 400 }
      );
    }

    if (!paymentId || typeof paymentId !== "string") {
      console.error("[API Orders] paymentId invalide", { paymentId });
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "paymentId est requis et doit être une chaîne",
        },
        { status: 400 }
      );
    }

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      console.error("[API Orders] paymentIntentId invalide", { paymentIntentId });
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "paymentIntentId est requis et doit être une chaîne",
        },
        { status: 400 }
      );
    }

    const data = { cartItems, addressId, paymentId, paymentIntentId };
    console.log("[API Orders] Données envoyées à orderController.createWithParams:", JSON.stringify(data, null, 2));

    if (!data || typeof data !== "object") {
      console.error("[API Orders] Données data invalides", { data });
      return NextResponse.json(
        {
          success: false,
          error: "Données invalides",
          details: "Les données envoyées à orderController doivent être un objet",
        },
        { status: 400 }
      );
    }

    const orderResponse = await orderController.createWithParams(data, userId, guestId || bodyGuestId);

    console.log("[API Orders] Commande créée avec succès", {
      orderId: orderResponse?.json?.order?.id,
      userId,
      guestId: guestId || bodyGuestId,
    });

    return orderResponse;
  } catch (error) {
    console.error("[API Orders] Erreur non gérée lors de la création de la commande:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur inattendue",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
=======
    // Récupérer ou créer un client Stripe
    console.log('[API Checkout] Récupération ou création du client Stripe:', { userId });
    let customerId: string;
    const user = await prisma.user.findUnique({
      where: { id_user: parseInt(userId) },
      select: { stripeCustomerId: true, email: true, first_name: true, last_name: true },
    });

    if (!user) {
      console.error('[API Checkout] Utilisateur non trouvé dans la base de données:', { userId });
      return NextResponse.json(
        { error: 'Utilisateur non trouvé dans la base de données' },
        { status: 404 }
      );
    }

    if (user.stripeCustomerId) {
      customerId = user.stripeCustomerId;
      console.log('[API Checkout] Client Stripe existant:', { customerId });
    } else {
      console.log('[API Checkout] Création d’un nouveau client Stripe:', { email: session?.user?.email || guestEmail || user.email });
      const customer = await stripe.customers.create({
        email: session?.user?.email || guestEmail || user.email,
        name: guestName || (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : undefined),
      });
      customerId = customer.id;

      // Mettre à jour l'utilisateur avec le stripeCustomerId
      await prisma.user.update({
        where: { id_user: parseInt(userId) },
        data: { stripeCustomerId: customerId },
      });
      console.log('[API Checkout] Nouveau client Stripe créé:', { customerId });
    }

    // Vérifier que le payment_method est valide
    console.log('[API Checkout] Vérification du payment_method:', { stripe_payment_id: paymentInfo.stripe_payment_id });
    try {
      await stripe.paymentMethods.retrieve(paymentInfo.stripe_payment_id);
      console.log('[API Checkout] PaymentMethod valide:', { stripe_payment_id: paymentInfo.stripe_payment_id });
    } catch (error: any) {
      console.error('[API Checkout] Erreur lors de la récupération du payment_method:', {
        stripe_payment_id: paymentInfo.stripe_payment_id,
        error: error.message,
      });
      return NextResponse.json(
        { error: 'Le payment_method est invalide ou non accessible', details: error.message },
        { status: 400 }
      );
    }

    // Associer le payment_method au client si nécessaire
    console.log('[API Checkout] Tentative d’attachement du payment_method:', { stripe_payment_id: paymentInfo.stripe_payment_id, customerId });
    try {
      await stripe.paymentMethods.attach(paymentInfo.stripe_payment_id, {
        customer: customerId,
      });
      console.log('[API Checkout] PaymentMethod attaché au client:', {
        paymentMethod: paymentInfo.stripe_payment_id,
        customerId,
      });
    } catch (error: any) {
      if (error.code !== 'resource_already_exists') {
        console.error('[API Checkout] Erreur lors de l’attachement du payment_method:', {
          error: error.message,
        });
        return NextResponse.json(
          { error: 'Erreur lors de l’association du moyen de paiement au client', details: error.message },
          { status: 400 }
        );
      }
      console.log('[API Checkout] PaymentMethod déjà attaché:', {
        paymentMethod: paymentInfo.stripe_payment_id,
        customerId,
      });
    }

    // Créer le PaymentIntent sans confirmation immédiate
    console.log('[API Checkout] Création du PaymentIntent:', {
      amount: Math.round(totalAmount * 100),
      customerId,
      paymentMethod: paymentInfo.stripe_payment_id,
    });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Montant en centimes
      currency: 'eur',
      customer: customerId,
      payment_method: paymentInfo.stripe_payment_id,
      // Supprimé : off_session: true, confirm: true
      metadata: {
        addressId,
        paymentId,
        userId,
      },
      description: `Commande pour utilisateur ${userId}`,
    });

    console.log('[API Checkout] PaymentIntent créé:', {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    });

    return NextResponse.json({
      success: true,
      message: 'Paiement initialisé avec succès',
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('[API Checkout] Erreur:', {
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code,
    });
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement du paiement', details: error.message },
>>>>>>> parent of 35a2ac8 (checkout fonctionnel avec facture)
      { status: 500 }
    );
  }
}