import { NextRequest, NextResponse } from "next/server";
import { AddressController } from "@/lib/controllers/AddressController";

export async function GET(req: NextRequest, context: { params: { id: string; id_address: string } }) {
    const { id, id_address } = await context.params

    if (!id || !id_address) {
        return NextResponse.json({ error: "User ID et Address ID requis" }, { status: 400 })
    }

    try {
        return await AddressController.getUserAddressById(id, id_address)
    } catch (error) {
        console.error("Erreur lors de la récupération de l'adresse spécifique :", error)
        return NextResponse.json({ error: "Erreur serveur lors de la récupération de l'adresse" }, { status: 500 })
    }
}

export async function PUT(req: NextRequest, context: { params: { id: string, id_address: string } }) {
    const { id, id_address } = await context.params;
    const data = await req.json();

    try {
        return await AddressController.updateAddress(id, id_address, data);
    } catch (error) {
        console.error("Erreur de mise à jour de l'adresse:", error);
        return NextResponse.json({ error: "Erreur de mise à jour de l'adresse" }, { status: 500 });
    }
}


