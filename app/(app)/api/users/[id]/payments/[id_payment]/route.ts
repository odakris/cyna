import { NextRequest } from "next/server";
import { paymentController } from "@/lib/controllers/paymentController";

// GET - Récupérer une méthode de paiement spécifique
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string, id_payment: string }> }) {
    const { id, id_payment } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    return await paymentController.getPayment(req, { params: Promise.resolve({ id, id_payment }) });
}

// PUT - Mettre à jour une méthode de paiement spécifique
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, id_payment: string }> }) {
    const { id, id_payment } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    return await paymentController.updatePaymentMethod(req, { params: Promise.resolve({ id, id_payment }) });
}

// DELETE - Supprimer une méthode de paiement spécifique
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string, id_payment: string }> }) {
    const { id, id_payment } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    return await paymentController.deletePaymentMethod(req, { params: Promise.resolve({ id, id_payment }) });
}