import { paymentRepository } from "../repositories/paymentRepository";
import { PaymentInfo } from "@prisma/client";

export const paymentService = {
    // Récupérer une méthode de paiement spécifique via le repository
    async fetchPayment(userId: number, paymentId: number): Promise<PaymentInfo | null> {
        try {
            // Appeler le repository pour récupérer la méthode de paiement spécifique
            const payment = await paymentRepository.getPaymentById(userId, paymentId);
            return payment; // Retourne le paiement trouvé ou null si rien n'est trouvé
        } catch (error) {
            console.error("Erreur lors de la récupération du paiement :", error);
            throw error; // Propager l'erreur à la couche supérieure
        }
    },

    async fetchPayments(userId: number): Promise<PaymentInfo[]> {
        return await paymentRepository.getPaymentsByUserId(userId);
    },

    async addPayment(userId: number, paymentData: any): Promise<PaymentInfo> {
        return await paymentRepository.createPayment(userId, paymentData)
    },

    async updatePayment(userId: number, paymentId: number, paymentData: any): Promise<PaymentInfo> {
        return await paymentRepository.updatePaymentInDb(userId, paymentId, paymentData);
    },

    async deletePayment(userId: number, paymentId: number): Promise<void> {
        return await paymentRepository.deletePaymentInDb(userId, paymentId);
    }
};
