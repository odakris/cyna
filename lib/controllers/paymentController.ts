import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "../services/paymentService";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/(app)/api/auth/[...nextauth]/route";
import { encrypt, decrypt } from "@/lib/utils/encryption";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-10-28.acacia",
});

// Middleware pour vérifier l'authentification
async function withAuth(
  req: NextRequest,
  userId: number,
  handler: (userId: number, ...args: any) => Promise<NextResponse>,
  ...args: any
) {
  try {
    // console.log("[PaymentController withAuth] Début vérification pour userId:", userId);
    const session = await getServerSession(authOptions);
    const xUserId = req.headers.get("x-user-id");
    // console.log("[PaymentController withAuth] En-têtes reçus:", { xUserId, sessionExists: !!session });

    if (!session?.user?.id_user && !xUserId) {
      console.error("[PaymentController withAuth] Aucune session ou x-user-id pour userId:", userId);
      return NextResponse.json(
        { message: "Non authentifié. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const sessionUserId = session?.user?.id_user ? parseInt(session.user.id_user) : null;
    const headerUserId = xUserId ? parseInt(xUserId) : null;

    /*console.log("[PaymentController withAuth] IDs comparés:", {
      sessionUserId,
      headerUserId,
      requestedUserId: userId,
    }); */

    if (
      (sessionUserId && isNaN(sessionUserId)) ||
      (headerUserId && isNaN(headerUserId)) ||
      (sessionUserId && sessionUserId !== userId) ||
      (headerUserId && headerUserId !== userId)
    ) {
      console.error("[PaymentController withAuth] Utilisateur non autorisé:", {
        sessionUserId,
        headerUserId,
        requestedUserId: userId,
      });
      return NextResponse.json(
        { message: "Non autorisé. Vous ne pouvez pas accéder aux données d'un autre utilisateur." },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { id_user: true },
    });
    if (!user) {
      console.error("[PaymentController withAuth] Utilisateur non trouvé pour userId:", userId);
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // console.log("[PaymentController withAuth] Authentification réussie pour userId:", userId);
    return await handler(userId, ...args);
  } catch (error: any) {
    console.error("[PaymentController withAuth] Erreur:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export const paymentController = {
  async getPayment(req: NextRequest, { params }: { params: Promise<{ id: string, id_payment: string }> }) {
    const { id, id_payment } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    const userId = parseInt(id, 10);
    const paymentId = parseInt(id_payment, 10);

    if (isNaN(userId) || isNaN(paymentId)) {
      console.error("[PaymentController getPayment] ID utilisateur ou paiement invalide:", { userId, paymentId });
      return NextResponse.json(
        { message: "ID utilisateur ou ID de paiement invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        console.log("[PaymentController getPayment] Récupération du paiement pour userId:", userId, "paymentId:", paymentId);
        const payment = await paymentService.fetchPayment(userId, paymentId);
        if (!payment) {
          console.log("[PaymentController getPayment] Paiement non trouvé:", { userId, paymentId });
          return NextResponse.json(
            { message: "Méthode de paiement introuvable" },
            { status: 404 }
          );
        }

        // Déchiffrer les champs sensibles
        const decryptedPayment = {
          ...payment,
          card_name: decrypt(payment.card_name),
          last_card_digits: decrypt(payment.last_card_digits),
        };

        console.log("[PaymentController getPayment] Paiement déchiffré:", { userId, paymentId });
        return NextResponse.json(decryptedPayment, { status: 200 });
      } catch (error: any) {
        console.error("[PaymentController getPayment] Erreur:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la récupération du paiement: ${error.message}` },
          { status: 500 }
        );
      }
    });
  },

  async getPayments(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      console.error("[PaymentController getPayments] ID utilisateur invalide:", { userId });
      return NextResponse.json(
        { message: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        // console.log("[PaymentController getPayments] Début récupération des paiements pour userId:", userId);
        const payments = await paymentService.fetchPayments(userId);
        // console.log("[PaymentController getPayments] Paiements bruts:", payments);

        if (payments.length === 0) {
          console.log("[PaymentController getPayments] Aucun paiement trouvé pour userId:", userId);
          return NextResponse.json([], { status: 200 });
        }

        // Déchiffrer les champs sensibles
        const decryptedPayments = payments.map(payment => {
          try {
            // console.log("[PaymentController getPayments] Déchiffrement pour paymentId:", payment.id_payment_info);
            return {
              ...payment,
              card_name: decrypt(payment.card_name),
              last_card_digits: decrypt(payment.last_card_digits),
            };
          } catch (error) {
            //   console.error(`[PaymentController getPayments] Échec du déchiffrement pour paymentId: ${payment.id_payment_info}`, error);
            throw error;
          }
        });

        //  console.log("[PaymentController getPayments] Paiements déchiffrés:", { userId, count: decryptedPayments.length });
        return NextResponse.json(decryptedPayments, { status: 200 });
      } catch (error: any) {
        console.error("[PaymentController getPayments] Erreur:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la récupération des paiements: ${error.message}` },
          { status: 500 }
        );
      }
    });
  },

  async createPaymentMethod(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      console.error("[PaymentController createPaymentMethod] ID utilisateur invalide:", { userId });
      return NextResponse.json(
        { message: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const body = await req.json();
        console.log("[PaymentController createPaymentMethod] Données reçues:", body);

        const {
          card_name,
          stripe_payment_id,
          stripe_customer_id,
          last_card_digits,
          brand,
          exp_month,
          exp_year,
          is_default = false,
        } = body;

        // Valider les données
        const requiredFields = ["card_name", "stripe_payment_id", "last_card_digits"];
        const missing = requiredFields.filter((field) => !body[field]);

        if (missing.length > 0) {
          console.error("[PaymentController createPaymentMethod] Champs manquants:", { missing });
          return NextResponse.json(
            { message: `Champs manquants : ${missing.join(", ")}` },
            { status: 400 }
          );
        }

        // Valider les longueurs
        if (card_name.length > 50) {
          console.error("[PaymentController createPaymentMethod] card_name trop long:", { length: card_name.length });
          return NextResponse.json(
            { message: "Le nom de la carte ne doit pas dépasser 50 caractères" },
            { status: 400 }
          );
        }
        if (last_card_digits.length !== 4) {
          console.error("[PaymentController createPaymentMethod] last_card_digits invalide:", { length: last_card_digits.length });
          return NextResponse.json(
            { message: "Les derniers chiffres de la carte doivent être exactement 4" },
            { status: 400 }
          );
        }

        // Vérifier que l'utilisateur existe et récupérer stripeCustomerId
        const user = await prisma.user.findUnique({
          where: { id_user: userId },
          select: { id_user: true, email: true, first_name: true, last_name: true, stripeCustomerId: true },
        });

        if (!user) {
          console.error("[PaymentController createPaymentMethod] Utilisateur non trouvé:", { userId });
          return NextResponse.json(
            { message: "Utilisateur non trouvé" },
            { status: 404 }
          );
        }

        let stripeCustomerId = user.stripeCustomerId;

        // Vérifier stripe_customer_id du corps
        if (stripe_customer_id) {
          if (user.stripeCustomerId && stripe_customer_id !== user.stripeCustomerId) {
            console.error("[PaymentController createPaymentMethod] stripe_customer_id non correspondant:", {
              provided: stripe_customer_id,
              stored: user.stripeCustomerId,
            });
            return NextResponse.json(
              { message: "L'identifiant Stripe fourni ne correspond pas à celui de l'utilisateur" },
              { status: 400 }
            );
          }
          stripeCustomerId = stripe_customer_id;
        }

        // Si stripeCustomerId est absent, en créer un
        if (!stripeCustomerId) {
          const stripeCustomer = await stripe.customers.create({
            email: user.email,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            metadata: { userId: user.id_user.toString() },
          });

          stripeCustomerId = stripeCustomer.id;

          // Mettre à jour l'utilisateur
          await prisma.user.update({
            where: { id_user: userId },
            data: { stripeCustomerId: stripeCustomerId },
          });

          console.log("[PaymentController createPaymentMethod] Client Stripe créé:", {
            userId,
            stripeCustomerId: stripeCustomerId,
          });
        }

        // Attacher le payment_method au client Stripe
        try {
          await stripe.paymentMethods.attach(stripe_payment_id, {
            customer: stripeCustomerId,
          });
          console.log("[PaymentController createPaymentMethod] Payment method attaché:", {
            stripe_payment_id,
            stripeCustomerId: stripeCustomerId,
          });
        } catch (error: any) {
          console.error("[PaymentController createPaymentMethod] Erreur lors de l'attachement du payment method:", error);
          return NextResponse.json(
            {
              message: "Erreur lors de l'association du moyen de paiement au client Stripe",
              details: error.message,
            },
            { status: 400 }
          );
        }

        // Si is_default est true, désactiver is_default pour les autres méthodes de paiement
        if (is_default) {
          await prisma.paymentInfo.updateMany({
            where: {
              id_user: userId,
              is_default: true,
            },
            data: {
              is_default: false,
            },
          })
          console.log("[PaymentController createPaymentMethod] Autres méthodes par défaut désactivées pour userId:", userId)
        }

        // Préparer les données pour paymentService.addPayment
        const paymentData = {
          card_name: encrypt(card_name),
          stripe_payment_id,
          stripe_customer_id: stripeCustomerId,
          last_card_digits: encrypt(last_card_digits),
          brand: brand || null,
          exp_month: exp_month || null,
          exp_year: exp_year || null,
          is_default,
        };

        console.log("[PaymentController createPaymentMethod] Données chiffrées:", paymentData);

        // Créer le PaymentInfo via paymentService
        const newPayment = await paymentService.addPayment(userId, paymentData);
        console.log("[PaymentController createPaymentMethod] Moyen de paiement créé:", {
          id_payment_info: newPayment.id_payment_info,
          stripe_payment_id,
          stripe_customer_id: stripeCustomerId,
        });

        // Déchiffrer pour la réponse
        const decryptedPayment = {
          ...newPayment,
          card_name,
          last_card_digits,
        };

        console.log("[PaymentController createPaymentMethod] Réponse envoyée:", decryptedPayment);
        return NextResponse.json(decryptedPayment, { status: 201 });
      } catch (error: any) {
        console.error("[PaymentController createPaymentMethod] Erreur:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la création du paiement: ${error.message}` },
          { status: 500 }
        );
      }
    });
  },

  async updatePaymentMethod(req: NextRequest, { params }: { params: Promise<{ id: string, id_payment: string }> }) {
    const { id, id_payment } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    const userId = parseInt(id, 10);
    const paymentId = parseInt(id_payment, 10);

    if (isNaN(userId) || isNaN(paymentId)) {
      console.error("[PaymentController updatePaymentMethod] ID utilisateur ou paiement invalide:", { userId, paymentId });
      return NextResponse.json(
        { message: "ID utilisateur ou ID de paiement invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const body = await req.json();
        console.log("[PaymentController updatePaymentMethod] Données reçues:", body);

        const {
          card_name,
          stripe_payment_id,
          stripe_customer_id,
          last_card_digits,
          brand,
          exp_month,
          exp_year,
        } = body;

        const requiredFields = ["card_name", "stripe_payment_id", "last_card_digits"];
        const missing = requiredFields.filter((field) => !body[field]);

        if (missing.length > 0) {
          console.error("[PaymentController updatePaymentMethod] Champs manquants:", { missing });
          return NextResponse.json(
            { message: `Champs manquants : ${missing.join(", ")}` },
            { status: 400 }
          );
        }

        // Valider les longueurs
        if (card_name.length > 50) {
          console.error("[PaymentController updatePaymentMethod] card_name trop long:", { length: card_name.length });
          return NextResponse.json(
            { message: "Le nom de la carte ne doit pas dépasser 50 caractères" },
            { status: 400 }
          );
        }
        if (last_card_digits.length !== 4) {
          console.error("[PaymentController updatePaymentMethod] last_card_digits invalide:", { length: last_card_digits.length });
          return NextResponse.json(
            { message: "Les derniers chiffres de la carte doivent être exactement 4" },
            { status: 400 }
          );
        }

        // Récupérer stripeCustomerId de l'utilisateur
        const user = await prisma.user.findUnique({
          where: { id_user: userId },
          select: { stripeCustomerId: true },
        });

        if (!user || !user.stripeCustomerId) {
          console.error("[PaymentController updatePaymentMethod] Utilisateur ou stripeCustomerId non trouvé:", { userId });
          return NextResponse.json(
            { message: "Utilisateur ou identifiant Stripe non trouvé" },
            { status: 404 }
          );
        }

        // Vérifier stripe_customer_id du corps
        if (stripe_customer_id && stripe_customer_id !== user.stripeCustomerId) {
          console.error("[PaymentController updatePaymentMethod] stripe_customer_id non correspondant:", {
            provided: stripe_customer_id,
            stored: user.stripeCustomerId,
          });
          return NextResponse.json(
            { message: "L'identifiant Stripe fourni ne correspond pas à celui de l'utilisateur" },
            { status: 400 }
          );
        }

        // Attacher le nouveau payment_method au client Stripe
        try {
          await stripe.paymentMethods.attach(stripe_payment_id, {
            customer: user.stripeCustomerId,
          });
          console.log("[PaymentController updatePaymentMethod] Payment method attaché:", {
            stripe_payment_id,
            stripeCustomerId: user.stripeCustomerId,
          });
        } catch (error: any) {
          console.error("[PaymentController updatePaymentMethod] Erreur lors de l'attachement du payment method:", error);
          return NextResponse.json(
            {
              message: "Erreur lors de l'association du moyen de paiement au client Stripe",
              details: error.message,
            },
            { status: 400 }
          );
        }

        // Ajouter stripe_customer_id et chiffrer les champs sensibles
        const paymentData = {
          card_name: encrypt(card_name),
          stripe_payment_id,
          stripe_customer_id: user.stripeCustomerId,
          last_card_digits: encrypt(last_card_digits),
          brand: brand || null,
          exp_month: exp_month || null,
          exp_year: exp_year || null,
        };

        console.log("[PaymentController updatePaymentMethod] Données chiffrées:", paymentData);

        const updatedPayment = await paymentService.replacePayment(userId, paymentId, paymentData);
        console.log("[PaymentController updatePaymentMethod] Paiement mis à jour:", updatedPayment);

        // Déchiffrer pour la réponse
        const decryptedPayment = {
          ...updatedPayment,
          card_name,
          last_card_digits,
        };

        console.log("[PaymentController updatePaymentMethod] Réponse envoyée:", decryptedPayment);
        return NextResponse.json(decryptedPayment, { status: 200 });
      } catch (error: any) {
        console.error("[PaymentController updatePaymentMethod] Erreur:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la mise à jour du paiement: ${error.message}` },
          { status: 500 }
        );
      }
    });
  },

  async deletePaymentMethod(req: NextRequest, { params }: { params: Promise<{ id: string, id_payment: string }> }) {
    const { id, id_payment } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    const userId = parseInt(id, 10);
    const paymentId = parseInt(id_payment, 10);

    if (isNaN(userId) || isNaN(paymentId)) {
      console.error("[PaymentController deletePaymentMethod] ID utilisateur ou paiement invalide:", { userId, paymentId });
      return NextResponse.json(
        { message: "ID utilisateur ou ID de paiement invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        console.log("[PaymentController deletePaymentMethod] Suppression du paiement pour userId:", userId, "paymentId:", paymentId);
        await paymentService.deletePayment(userId, paymentId);
        console.log("[PaymentController deletePaymentMethod] Paiement supprimé:", { userId, paymentId });
        return NextResponse.json(
          { message: "Méthode de paiement supprimée avec succès" },
          { status: 200 }
        );
      } catch (error: any) {
        console.error("[PaymentController deletePaymentMethod] Erreur:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la suppression du paiement: ${error.message}` },
          { status: 500 }
        );
      }
    });
  },
};