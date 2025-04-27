import { paymentRepository } from "../repositories/paymentRepository";
import { PaymentInfo } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-06-20",
});

export const paymentService = {
    async fetchPayment(userId: number, paymentId: number): Promise<PaymentInfo | null> {
        try {
            const payment = await paymentRepository.getPaymentById(userId, paymentId);
            return payment;
        } catch (error) {
            console.error("Erreur lors de la récupération du paiement :", error);
            throw error;
        }
    },

    async fetchPayments(userId: number): Promise<PaymentInfo[]> {
        return await paymentRepository.getPaymentsByUserId(userId);
    },

    async addPayment(userId: number, paymentData: any): Promise<PaymentInfo> {
        const user = await paymentRepository.getUserById(userId);
        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        if (!user.stripeCustomerId) {
            throw new Error("Aucun client Stripe associé à cet utilisateur");
        }

        try {
            await stripe.paymentMethods.attach(paymentData.stripe_payment_id, {
                customer: user.stripeCustomerId,
            });

            if (paymentData.is_default) {
                await stripe.customers.update(user.stripeCustomerId, {
                    invoice_settings: {
                        default_payment_method: paymentData.stripe_payment_id,
                    },
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'attachement du PaymentMethod à Stripe:", error);
            throw new Error("Impossible d'attacher la méthode de paiement à Stripe");
        }

        return await paymentRepository.createPayment(userId, paymentData);
    },

    async updatePayment(userId: number, paymentId: number, paymentData: any): Promise<PaymentInfo> {
        return await paymentRepository.updatePaymentInDb(userId, paymentId, paymentData);
    },

    async deletePayment(userId: number, paymentId: number): Promise<void> {
        const payment = await paymentRepository.getPaymentById(userId, paymentId);
        if (!payment) {
            console.error(`Méthode de paiement ${paymentId} introuvable pour l'utilisateur ${userId}`);
            throw new Error("Méthode de paiement introuvable");
        }

        if (payment.is_default) {
            const otherPayments = await paymentRepository.getPaymentsByUserId(userId);
            const otherAvailablePayments = otherPayments.filter(p => p.id_payment_info !== paymentId);
            if (otherAvailablePayments.length === 0) {
                throw new Error("Impossible de supprimer la seule méthode de paiement par défaut");
            }
        }

        // Supprimer la méthode de paiement dans Stripe
        try {
            await stripe.paymentMethods.detach(payment.stripe_payment_id);
        } catch (error: any) {
            console.error("Erreur lors de la suppression du PaymentMethod dans Stripe:", error);
            if (error.code === "resource_missing") {
                console.warn(`La méthode de paiement ${payment.stripe_payment_id} est déjà détachée ou n'existe pas dans Stripe`);
            } else {
                throw new Error(`Impossible de supprimer la méthode de paiement dans Stripe: ${error.message}`);
            }
        }

        // Supprimer dans la base de données
        try {
            await paymentRepository.deletePaymentInDb(userId, paymentId);
        } catch (error) {
            console.error("Erreur lors de la suppression dans la base de données:", error);
            throw new Error("Impossible de supprimer la méthode de paiement dans la base de données");
        }
    },

    async replacePayment(userId: number, paymentId: number, newPaymentData: any): Promise<PaymentInfo> {
        // Récupérer l'utilisateur pour obtenir stripeCustomerId
        const user = await paymentRepository.getUserById(userId);
        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        if (!user.stripeCustomerId) {
            throw new Error("Aucun client Stripe associé à cet utilisateur");
        }

        // Supprimer l'ancienne méthode de paiement
        await paymentService.deletePayment(userId, paymentId);

        // Créer une nouvelle méthode de paiement
        try {
            await stripe.paymentMethods.attach(newPaymentData.stripe_payment_id, {
                customer: user.stripeCustomerId,
            });

            if (newPaymentData.is_default) {
                await stripe.customers.update(user.stripeCustomerId, {
                    invoice_settings: {
                        default_payment_method: newPaymentData.stripe_payment_id,
                    },
                });
            }
        } catch (error) {
            console.error("Erreur lors de l'attachement du nouveau PaymentMethod à Stripe:", error);
            throw new Error("Impossible d'attacher la nouvelle méthode de paiement à Stripe");
        }

        // Enregistrer la nouvelle méthode de paiement dans la base de données
        return await paymentRepository.createPayment(userId, newPaymentData);
    },
};