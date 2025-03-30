import { getPaymentsByUserId } from "../repositories/paymentRepository";
import { PaymentInfo } from "@prisma/client";

// Fonction pour récupérer les paiements d'un utilisateur
export async function fetchPayments(userId: number): Promise<PaymentInfo[]> {
    try {
        const payments = await getPaymentsByUserId(userId);
        return payments;
    } catch (error) {
        console.error("Erreur dans le service des paiements :", error);
        throw new Error("Erreur lors de la récupération des paiements");
    }
}
