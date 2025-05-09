import { NextRequest, NextResponse } from "next/server";
import { paymentService } from "../services/paymentService";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/(app)/api/auth/[...nextauth]/route";

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
    console.log("[PaymentController withAuth] Vérification de la session pour userId:", userId);
    const session = await getServerSession(authOptions);
    console.log("[PaymentController withAuth] Session récupérée:", {
      sessionExists: !!session,
      userIdInSession: session?.user?.id_user,
    });

    if (!session?.user?.id_user) {
      console.error("[PaymentController withAuth] Session manquante ou utilisateur non connecté", { userId });
      return NextResponse.json(
        { message: "Non authentifié. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const sessionUserId = session.user.id_user;
    if (isNaN(sessionUserId) || sessionUserId !== userId) {
      console.error("[PaymentController withAuth] Utilisateur non autorisé", {
        sessionUserId: session.user.id_user,
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
      console.error("[PaymentController withAuth] Utilisateur non trouvé", { userId });
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log("[PaymentController withAuth] Authentification réussie pour userId:", userId);
    return await handler(userId, ...args);
  } catch (error: any) {
    console.error("[PaymentController withAuth] Erreur", {
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
  async getPayment(req: NextRequest, { params }: { params: { id: string, id_payment: string } }) {
    const userId = parseInt(params.id, 10);
    const paymentId = parseInt(params.id_payment, 10);

    if (isNaN(userId) || isNaN(paymentId)) {
      return NextResponse.json({ message: "ID utilisateur ou ID de paiement invalide" }, { status: 400 });
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const payment = await paymentService.fetchPayment(userId, paymentId);
        if (!payment) {
          return NextResponse.json({ message: "Méthode de paiement introuvable" }, { status: 404 });
        }
        return NextResponse.json(payment);
      } catch {
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
      }
    });
  },

  async getPayments(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ message: "ID utilisateur invalide" }, { status: 400 });
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const payments = await paymentService.fetchPayments(userId);
        return NextResponse.json(payments);
      } catch {
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
      }
    });
  },

  async createPaymentMethod(req: NextRequest, { params }: { params: { id: string } }) {
    const userId = parseInt(params.id, 10);
    if (isNaN(userId)) {
      console.error("[PaymentController createPaymentMethod] ID utilisateur invalide:", { userId });
      return NextResponse.json({ message: "ID utilisateur invalide" }, { status: 400 });
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const body = await req.json();
        console.log("[PaymentController createPaymentMethod] Données reçues:", body);

        const {
          card_name,
          stripe_payment_id,
          last_card_digits,
          brand,
          exp_month,
          exp_year,
          is_default = false,
        } = body;

        // Valider les données
        const requiredFields = ["card_name", "stripe_payment_id", "last_card_digits", "brand"];
        const missing = requiredFields.filter((field) => !body[field]);

        if (missing.length > 0) {
          console.error("[PaymentController createPaymentMethod] Champs manquants:", { missing });
          return NextResponse.json(
            { message: `Champs manquants : ${missing.join(", ")}` },
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
          return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
        }

        let stripeCustomerId = user.stripeCustomerId;

        // Si stripeCustomerId est absent
        if (!stripeCustomerId) {
          const stripeCustomer = await stripe.customers.create({
            email: user.email,
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            metadata: { userId: user.id_user.toString() },
          });

          stripeCustomerId = stripeCustomer.id;

          // Mettre à jour l'utilisateur avec le nouveau stripeCustomerId
          await prisma.user.update({
            where: { id_user: userId },
            data: { stripeCustomerId },
          });

          console.log("[PaymentController createPaymentMethod] Client Stripe créé:", {
            userId,
            stripeCustomerId,
          });
        }

        // Attacher le payment_method au client Stripe
        try {
          await stripe.paymentMethods.attach(stripe_payment_id, {
            customer: stripeCustomerId,
          });
          console.log("[PaymentController createPaymentMethod] Payment method attaché:", {
            stripe_payment_id,
            stripeCustomerId,
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
          card_name,
          stripe_payment_id,
          stripe_customer_id: stripeCustomerId,
          last_card_digits,
          brand,
          exp_month: exp_month || null,
          exp_year: exp_year || null,
          is_default,
        };

        // Créer le PaymentInfo via paymentService
        const newPayment = await paymentService.addPayment(userId, paymentData);
        console.log("[PaymentController createPaymentMethod] Moyen de paiement créé:", {
          id_payment_info: newPayment.id_payment_info,
          stripe_payment_id,
          stripe_customer_id: stripeCustomerId,
          is_default,
        });

        return NextResponse.json(newPayment, { status: 201 });
      } catch (err: any) {
        console.error("[PaymentController createPaymentMethod] Erreur:", err);
        return NextResponse.json(
          { message: err.message || "Erreur interne du serveur" },
          { status: 500 }
        );
      }
    });
  },

  async updatePaymentMethod(req: NextRequest, { params }: { params: { id: string, id_payment: string } }) {
    const userId = parseInt(params.id, 10);
    const paymentId = parseInt(params.id_payment, 10);

    if (isNaN(userId) || isNaN(paymentId)) {
      return NextResponse.json({ message: "ID utilisateur ou ID de paiement invalide" }, { status: 400 });
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const body = await req.json();
        console.log("[PaymentController updatePaymentMethod] Données reçues:", body);

        const requiredFields = ["stripe_payment_id", "card_name", "brand", "last_card_digits"];
        const missing = requiredFields.filter((field) => !body[field]);

        if (missing.length > 0) {
          console.error("[PaymentController updatePaymentMethod] Champs manquants:", { missing });
          return NextResponse.json(
            { message: `Champs manquants : ${missing.join(", ")}` },
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

        // Attacher le nouveau payment_method au client Stripe
        try {
          await stripe.paymentMethods.attach(body.stripe_payment_id, {
            customer: user.stripeCustomerId,
          });
          console.log("[PaymentController updatePaymentMethod] Payment method attaché:", {
            stripe_payment_id: body.stripe_payment_id,
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

        // Ajouter stripe_customer_id aux données
        const paymentData = {
          ...body,
          stripe_customer_id: user.stripeCustomerId,
        };

        const updatedPayment = await paymentService.replacePayment(userId, paymentId, paymentData);
        console.log("[PaymentController updatePaymentMethod] PaymentMethod remplacé:", updatedPayment);
        return NextResponse.json(updatedPayment);
      } catch (err: any) {
        console.error("[PaymentController updatePaymentMethod] Erreur:", err);
        return NextResponse.json(
          { message: err.message || "Erreur interne du serveur" },
          { status: 500 }
        );
      }
    });
  },

  async deletePaymentMethod(req: NextRequest, { params }: { params: { id: string, id_payment: string } }) {
    const userId = parseInt(params.id, 10);
    const paymentId = parseInt(params.id_payment, 10);

    if (isNaN(userId) || isNaN(paymentId)) {
      return NextResponse.json({ message: "ID utilisateur ou ID de paiement invalide" }, { status: 400 });
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        await paymentService.deletePayment(userId, paymentId);
        return NextResponse.json({ message: "Méthode de paiement supprimée avec succès" });
      } catch (err: any) {
        console.error("[PaymentController deletePaymentMethod] Erreur:", err);
        return NextResponse.json(
          { message: err.message || "Erreur interne du serveur" },
          { status: 500 }
        );
      }
    });
  },
};