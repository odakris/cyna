import { NextRequest, NextResponse } from "next/server";
import { AddressController } from "@/lib/controllers/AddressController";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string, id_address: string }> }) {
  try {
    const { id, id_address } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    // console.log("[Route GET /api/users/[id]/addresses/[id_address]] Appel avec userId:", id, "id_address:", id_address);

    if (!id || !id_address) {
      // console.error("[Route GET /api/users/[id]/addresses/[id_address]] ID utilisateur ou adresse manquant", { id, id_address });
      return NextResponse.json(
        { message: "ID utilisateur ou ID d'adresse requis" },
        { status: 400 }
      );
    }

    return await AddressController.getUserAddressById(req, id, id_address);
  } catch (error) {
    // console.error("[Route GET /api/users/[id]/addresses/[id_address]] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération de l'adresse" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, id_address: string }> }) {
  try {
    const { id, id_address } = await params; // MODIFIÉ : Attendre params pour accès asynchrone
    // console.log("[Route PUT /api/users/[id]/addresses/[id_address]] Appel avec userId:", id, "id_address:", id_address);

    if (!id || !id_address) {
      // console.error("[Route PUT /api/users/[id]/addresses/[id_address]] ID utilisateur ou adresse manquant", { id, id_address });
      return NextResponse.json(
        { message: "ID utilisateur ou ID d'adresse requis" },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("[Route PUT /api/users/[id]/addresses/[id_address]] Données reçues:", body);

    if (!body || Object.keys(body).length === 0) {
      // console.error("[Route PUT /api/users/[id]/addresses/[id_address]] Données de l'adresse manquantes");
      return NextResponse.json(
        { message: "Données de l'adresse requises" },
        { status: 400 }
      );
    }

    return await AddressController.updateAddress(req, id, id_address, body);
  } catch (error) {
    // console.error("[Route PUT /api/users/[id]/addresses/[id_address]] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la mise à jour de l'adresse" },
      { status: 500 }
    );
  }
}