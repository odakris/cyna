import { PrismaClient } from "@prisma/client" // Utilisation de Prisma pour la gestion de la base de données

const prisma = new PrismaClient()

// Ajouter une nouvelle méthode de paiement
export const addPaymentMethod = async (newMethod: any) => {
    try {
        // Ajouter une méthode de paiement dans la base de données
        const paymentMethod = await prisma.paymentMethod.create({
            data: newMethod,  // Les données de la nouvelle méthode de paiement (ex : numéro de carte, etc.)
        })
        return paymentMethod
    } catch (error) {
        throw new Error("Erreur lors de l'ajout de la méthode de paiement")
    }
}

// Supprimer une méthode de paiement
export const deletePaymentMethod = async (methodId: string) => {
    try {
        // Supprimer une méthode de paiement de la base de données
        await prisma.paymentMethod.delete({
            where: { id: methodId }, // Utilise l'ID pour identifier la méthode à supprimer
        })
        return { success: true }
    } catch (error) {
        throw new Error("Erreur lors de la suppression de la méthode de paiement")
    }
}
