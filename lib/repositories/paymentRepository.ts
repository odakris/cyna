import { prisma } from "../prisma";
import { PaymentInfo } from "@prisma/client";  // Le modèle Prisma

// Fonction pour récupérer les informations de paiement pour un utilisateur donné
export async function getPaymentsByUserId(userId: number): Promise<PaymentInfo[]> {
    try {
        const payments = await prisma.paymentInfo.findMany({
            where: {
                id_user: userId,  // Filtre par l'ID utilisateur
            },
        });
        return payments;
    } catch (error) {
        console.error("Erreur lors de la récupération des paiements :", error);
        throw new Error("Erreur interne du serveur");
    }
}
