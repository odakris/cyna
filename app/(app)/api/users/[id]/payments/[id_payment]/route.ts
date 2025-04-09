import { NextRequest } from "next/server";
import { paymentController } from "@/lib/controllers/paymentController";

// GET - Récupérer une méthode de paiement spécifique
export async function GET(req: NextRequest, { params }: { params: { id: string, id_payment: string } }) {
    return await paymentController.getPayment(req, { params });
}

// PUT - Mettre à jour une méthode de paiement spécifique
export async function PUT(req: NextRequest, { params }: { params: { id: string, id_payment: string } }) {
    return await paymentController.updatePaymentMethod(req, { params });
}

// DELETE - Supprimer une méthode de paiement spécifique
export async function DELETE(req: NextRequest, { params }: { params: { id: string, id_payment: string } }) {
    return await paymentController.deletePaymentMethod(req, { params });
}
