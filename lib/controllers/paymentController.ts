import { fetchPayments } from "../services/paymentService";
import { NextResponse } from "next/server";

// Contrôleur pour récupérer les paiements d'un utilisateur
export async function getPaymentsController(req: Request, { params }: { params: { id: string } }) {
    // Extraction de l'id de l'utilisateur de manière synchrone
    const userId = await parseInt(params.id, 10);

    if (isNaN(userId)) {
        return NextResponse.json({ message: "ID utilisateur invalide" }, { status: 400 });
    }

    try {
        const payments = await fetchPayments(userId);  // Attente des paiements
        return NextResponse.json(payments);
    } catch (error) {
        console.error("Erreur lors de la récupération des paiements :", error);
        return NextResponse.json({ message: "Erreur interne du serveur" }, { status: 500 });
    }
}
