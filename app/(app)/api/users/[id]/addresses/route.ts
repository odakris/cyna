import { NextRequest, NextResponse } from "next/server";
import  {AddressController} from "@/lib/controllers/AddressController";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string, id_address?: string }> }) {
  try {
    const { id, id_address } = await params;
    console.log("[Route GET /api/users/[id]/addresses] Appel avec userId:", id, "id_address:", id_address);

    if (!id) {
      console.error("[Route GET /api/users/[id]/addresses] ID utilisateur manquant");
      return NextResponse.json(
        { message: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    if (id_address) {
      return await AddressController.getUserAddressById(req, id, id_address);
    }

    return await AddressController.getUserAddresses(req, id);
  } catch (error) {
    console.error("[Route GET /api/users/[id]/addresses] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la récupération des adresses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log("[Route POST /api/users/[id]/addresses] Appel avec userId:", id);

    if (!id) {
      console.error("[Route POST /api/users/[id]/addresses] ID utilisateur manquant");
      return NextResponse.json(
        { message: "ID utilisateur requis" },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("[Route POST /api/users/[id]/addresses] Données reçues:", body);

    if (!body || Object.keys(body).length === 0) {
      console.error("[Route POST /api/users/[id]/addresses] Données de l'adresse manquantes");
      return NextResponse.json(
        { message: "Données de l'adresse requises" },
        { status: 400 }
      );
    }

    return await AddressController.createAddress(req, id, body);
  } catch (error) {
    console.error("[Route POST /api/users/[id]/addresses] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la création de l'adresse" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string, id_address: string }> }) {
  try {
    const { id, id_address } = await params;
    console.log("[Route PUT /api/users/[id]/addresses] Appel avec userId:", id, "id_address:", id_address);

    if (!id || !id_address) {
      console.error("[Route PUT /api/users/[id]/addresses] ID utilisateur ou adresse manquant", { id, id_address });
      return NextResponse.json(
        { message: "ID utilisateur ou ID d'adresse requis" },
        { status: 400 }
      );
    }

    const body = await req.json();
    console.log("[Route PUT /api/users/[id]/addresses] Données reçues:", body);

    if (!body || Object.keys(body).length === 0) {
      console.error("[Route PUT /api/users/[id]/addresses] Données de l'adresse manquantes");
      return NextResponse.json(
        { message: "Données de l'adresse requises" },
        { status: 400 }
      );
    }

    return await AddressController.updateAddress(req, id, id_address, body);
  } catch (error) {
    console.error("[Route PUT /api/users/[id]/addresses] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la mise à jour de l'adresse" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const id_address = req.nextUrl.searchParams.get('addressId');
    console.log("[Route DELETE /api/users/[id]/addresses] Appel avec userId:", id, "id_address:", id_address);

    if (!id || !id_address) {
      console.error("[Route DELETE /api/users/[id]/addresses] ID utilisateur ou adresse manquant", { id, id_address });
      return NextResponse.json(
        { message: "ID utilisateur et ID d'adresse requis" },
        { status: 400 }
      );
    }

    return await AddressController.deleteAddress(req, id, id_address);
  } catch (error) {
    console.error("[Route DELETE /api/users/[id]/addresses] Erreur:", error);
    return NextResponse.json(
      { message: "Erreur serveur lors de la suppression de l'adresse" },
      { status: 500 }
    );
  }
}