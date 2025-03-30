import { getPaymentsController } from "@/lib/controllers/paymentController";

// Méthode GET pour récupérer les informations de paiement d'un utilisateur
export async function GET(req: Request, { params }: { params: { id: string } }) {
    return await getPaymentsController(req, { params });
}
