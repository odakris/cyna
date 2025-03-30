import { prisma } from "@/lib/prisma";

export class AddressRepository {
    static async getAddressesByUserId(userId: string) {
        const addresses = await prisma.address.findMany({
            where: { id_user: parseInt(userId) }, // Filtre sur l'utilisateur connecté
            orderBy: { is_default_billing: "desc" }, // Trier pour avoir l'adresse principale en premier
        });

        // console.log("Addresses fetched:", addresses);
        return addresses;
    }
}
