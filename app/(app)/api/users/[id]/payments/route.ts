import { NextRequest } from "next/server";
import { paymentController } from "@/lib/controllers/paymentController";

// GET - Récupérer toutes les méthodes de paiement
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log("[Route GET /api/users/[id]/payments] Appel avec userId:", id);
    return paymentController.getPayments(req, { params: { id } });
}

// POST - Ajouter une nouvelle méthode de paiement
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    console.log("[Route POST /api/users/[id]/payments] Appel avec userId:", id);
    return paymentController.createPaymentMethod(req, { params: { id } });
}