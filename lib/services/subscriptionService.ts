import { PrismaClient } from "@prisma/client" // Utilisation de Prisma pour la gestion de la base de données

const prisma = new PrismaClient()

// Fonction pour mettre à jour un abonnement
export const updateSubscription = async (subscriptionId: string, newPlan: string) => {
    try {
        // Met à jour l'abonnement avec le nouveau plan
        const updatedSubscription = await prisma.subscription.update({
            where: { id: subscriptionId }, // Trouve l'abonnement à mettre à jour
            data: {
                plan: newPlan, // Met à jour le plan de l'abonnement
                updatedAt: new Date(), // Date de mise à jour de l'abonnement
            },
        })
        return updatedSubscription
    } catch (error) {
        throw new Error("Erreur lors de la mise à jour de l'abonnement")
    }
}

// Fonction pour annuler un abonnement
export const cancelSubscription = async (subscriptionId: string) => {
    try {
        // Annule l'abonnement en le supprimant de la base de données
        const canceledSubscription = await prisma.subscription.delete({
            where: { id: subscriptionId }, // Trouve l'abonnement à annuler
        })
        return canceledSubscription
    } catch (error) {
        throw new Error("Erreur lors de l'annulation de l'abonnement")
    }
}
