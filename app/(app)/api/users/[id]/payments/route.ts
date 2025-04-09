import { NextRequest } from "next/server";
import { paymentController } from "@/lib/controllers/paymentController";

// GET - Récupérer toutes les méthodes de paiement
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    return await paymentController.getPayments(req, { params });
}

// POST - Ajouter une nouvelle méthode de paiement
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    return await paymentController.createPaymentMethod(req, { params });
}
