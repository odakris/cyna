import { prisma } from "../prisma";
import { PaymentInfo } from "@prisma/client";

export const paymentRepository = {
    // Récupérer toutes les méthodes de paiement d'un utilisateur
    async getPaymentsByUserId(userId: number): Promise<PaymentInfo[]> {
        return await prisma.paymentInfo.findMany({
            where: { id_user: userId },
        });
    },

    // Récupérer une méthode de paiement spécifique d'un utilisateur
    async getPaymentById(userId: number, paymentId: number): Promise<PaymentInfo | null> {
        return await prisma.paymentInfo.findUnique({
            where: {
                id_payment_info: paymentId, // On filtre par l'id_payment_info
                id_user: userId, // et l'id_user
            },
        });
    },

    // Ajouter une nouvelle méthode de paiement
    async createPayment(userId: number, paymentData: any): Promise<PaymentInfo> {
        return await prisma.paymentInfo.create({
            data: {
                id_user: userId,
                ...paymentData,
            },
        });
    },

    // Mettre à jour une méthode de paiement
    async updatePaymentInDb(userId: number, paymentId: number, paymentData: any): Promise<PaymentInfo> {
        return await prisma.paymentInfo.update({
            where: { id_payment_info: paymentId },
            data: paymentData,
        });
    },

    // Supprimer une méthode de paiement
    async deletePaymentInDb(userId: number, paymentId: number): Promise<void> {
        await prisma.paymentInfo.delete({
            where: { id_payment_info: paymentId },
        });
    }
};
