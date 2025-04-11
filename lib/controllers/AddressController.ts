import { NextResponse } from "next/server"
import { AddressService } from "@/lib/services/AddressService"

export class AddressController {
    static async getUserAddresses(id: string) {
        if (!id) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 }
            )
        }

        try {
            const addresses = await AddressService.getUserAddresses(id)

            if (addresses.length === 0) {
                return NextResponse.json(
                    { error: "Aucune adresse trouvée" },
                    { status: 404 }
                )
            }

            return NextResponse.json(addresses, { status: 200 })
        } catch (error) {
            console.error("AddressController Error fetching addresses:", error)
            return NextResponse.json(
                { error: "Controller Error fetching addresses" },
                { status: 500 }
            )
        }
    }
    // Nouvelle méthode pour obtenir une adresse spécifique par ID
    static async getUserAddressById(id: string, id_address: string) {
        if (!id || !id_address) {
            return NextResponse.json({ error: "User ID et Address ID requis" }, { status: 400 });
        }

        try {
            // Appel de la méthode dans AddressService pour récupérer l'adresse spécifique
            const address = await AddressService.getUserAddressById(id, id_address);

            if (!address) {
                return NextResponse.json({ error: "Adresse non trouvée" }, { status: 404 });
            }

            return NextResponse.json(address, { status: 200 });
        } catch (error) {
            console.error("Erreur lors de la récupération de l'adresse spécifique :", error);
            return NextResponse.json({ error: "Erreur serveur lors de la récupération de l'adresse" }, { status: 500 });
        }
    }

    static async createAddress(userId: string, data: any) {
        if (!userId || !data) {
            return NextResponse.json({ error: "User ID et données requises" }, { status: 400 });
        }

        console.log("Creating address for user:", userId);
        console.log("Address data:", data);  // <-- Log les données pour vérifier qu'elles sont bien formatées.

        try {
            const created = await AddressService.createAddress(userId, data);

            if (!created) {
                throw new Error("Création échouée, aucune donnée retournée");
            }

            return NextResponse.json(created, { status: 201 });
        } catch (error) {
            console.error("Erreur lors de la création de l'adresse (controller):", error);
            return NextResponse.json({ error: "Erreur serveur lors de la création de l'adresse" }, { status: 500 });
        }
    }

    // Nouvelle méthode pour mettre à jour une adresse spécifique
    static async updateAddress(id: string, id_address: string, data: any) {
        if (!id || !id_address || !data) {
            return NextResponse.json({ error: "User ID, Address ID, and data are required" }, { status: 400 });
        }

        try {
            const updatedAddress = await AddressService.updateAddress(id, id_address, data);
            if (!updatedAddress) {
                return NextResponse.json({ error: "Adresse non trouvée" }, { status: 404 });
            }
            return NextResponse.json(updatedAddress, { status: 200 });
        } catch (error) {
            console.error("Error updating address:", error);
            return NextResponse.json({ error: "Erreur lors de la mise à jour de l'adresse" }, { status: 500 });
        }
    }

    static async deleteAddress(userId: string, addressId: string) {
        return await AddressService.deleteAddress(userId, addressId)
    }

}