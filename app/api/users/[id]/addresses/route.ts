import { NextRequest, NextResponse } from "next/server";
import { AddressController } from "@/lib/controllers/AddressController";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        return await AddressController.getUserAddresses(id);
    } catch (error) {
        console.error("Error fetching addresses in API route:", error);
        return NextResponse.json({ error: "API Error fetching addresses" }, { status: 500 });
    }
}

export async function POST(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 })
        }

        // Récupère les données envoyées
        const body = await req.json();
        console.log("Données reçues côté serveur:", body);

        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ error: "Données de l'adresse manquantes" }, { status: 400 });
        }

        return await AddressController.createAddress(id, body);
    } catch (error) {
        console.error("Error creating address in API route:", error)
        return NextResponse.json({ error: "API Error creating address" }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { searchParams } = new URL(req.url)
    const id_address = searchParams.get("addressId")
  
    if (!params.id || !id_address) {
      return NextResponse.json({ error: "User ID et Address ID requis" }, { status: 400 })
    }
  
    try {
      const deleted = await AddressController.deleteAddress(params.id, id_address)
      return NextResponse.json(deleted, { status: 200 })
    } catch (error) {
      console.error("Erreur suppression adresse :", error)
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
    }
  }
  