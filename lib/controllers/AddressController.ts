import { NextResponse } from "next/server";
import { AddressService } from "../services/AddressService";

export class AddressController {
    static async getUserAddresses(id: string) {
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        try {
            const addresses = await AddressService.getUserAddresses(id);

            if (addresses.length === 0) {
                return NextResponse.json({ error: "Aucune adresse trouvée" }, { status: 404 });
            }

            return NextResponse.json(addresses, { status: 200 });
        } catch (error) {
            console.error("AddressController Error fetching addresses:", error);
            return NextResponse.json({ error: "Controller Error fetching addresses" }, { status: 500 });
        }
    }
}
