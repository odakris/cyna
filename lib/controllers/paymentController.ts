import { NextResponse } from "next/server";
import { paymentService } from "../services/paymentService";

export const paymentController = {
    // Méthode pour récupérer une méthode de paiement spécifique
    async getPayment(req: Request, { params }: { params: { id: string, id_payment: string } }) {
        const userId = parseInt(params.id, 10);
        const paymentId = parseInt(params.id_payment, 10); // Récupérer l'ID du paiement depuis l'URL

        if (isNaN(userId) || isNaN(paymentId)) {
            return NextResponse.json({ message: "ID utilisateur ou ID de paiement invalide" }, { status: 400 });
        }

        try {
            // Appel à paymentService pour récupérer une méthode de paiement spécifique
            const payment = await paymentService.fetchPayment(userId, paymentId);

            if (!payment) {
                return NextResponse.json({ message: "Méthode de paiement introuvable" }, { status: 404 });
            }

            return NextResponse.json(payment); // Retourne les informations de la méthode de paiement
        } catch {
            return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
        }
    },

    async getPayments(req: Request, { params }: { params: { id: string } }) {
        const userId = parseInt(params.id, 10);
        if (isNaN(userId)) {
            return NextResponse.json({ message: "ID utilisateur invalide" }, { status: 400 });
        }

        try {
            const payments = await paymentService.fetchPayments(userId);
            return NextResponse.json(payments);
        } catch {
            return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
        }
    },

    // Méthode pour ajouter une nouvelle méthode de paiement
    async createPaymentMethod(req: Request, { params }: { params: { id: string } }) {
        const userId = parseInt(params.id, 10)
        const body = await req.json()

        console.log("Received body in controller:", body)

        if (isNaN(userId)) {
            return NextResponse.json({ message: "ID utilisateur invalide" }, { status: 400 })
        }

        const requiredFields = ["stripe_payment_method_id", "card_name", "brand", "last_card_digits"]
        const missing = requiredFields.filter(field => !body[field])

        if (missing.length > 0) {
            return NextResponse.json(
                { message: `Champs manquants : ${missing.join(", ")}` },
                { status: 400 }
            )
        }

        try {
            const newPayment = await paymentService.addPayment(userId, body)
            return NextResponse.json(newPayment, { status: 201 })
        } catch (err) {
            console.error("Erreur backend:", err)
            return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 })
        }
    },


    // Méthode pour mettre à jour une méthode de paiement
    async updatePaymentMethod(req: Request, { params }: { params: { id: string } }) {
        const userId = parseInt(params.id, 10);
        const { paymentId } = req.query;
        const body = await req.json();

        if (isNaN(userId) || !paymentId) {
            return NextResponse.json({ message: "ID utilisateur ou ID de paiement invalide" }, { status: 400 });
        }

        try {
            const updatedPayment = await paymentService.updatePayment(userId, parseInt(paymentId as string, 10), body);
            return NextResponse.json(updatedPayment);
        } catch {
            return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
        }
    },

    // Méthode pour supprimer une méthode de paiement
    async deletePaymentMethod(req: Request, { params }: { params: { id: string } }) {
        const userId = parseInt(params.id, 10);
        const { paymentId } = req.query;

        if (isNaN(userId) || !paymentId) {
            return NextResponse.json({ message: "ID utilisateur ou ID de paiement invalide" }, { status: 400 });
        }

        try {
            await paymentService.deletePayment(userId, parseInt(paymentId as string, 10));
            return NextResponse.json({ message: "Méthode de paiement supprimée avec succès" });
        } catch {
            return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
        }
    }
};
