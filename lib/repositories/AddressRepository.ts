import { prisma } from "@/lib/prisma";

export class AddressRepository {
    // Récupérer toutes les adresses d'un utilisateur
    static async getAddressesByUserId(userId: string) {
        const addresses = await prisma.address.findMany({
            where: { id_user: parseInt(userId) }, // Filtre sur l'utilisateur connecté
            orderBy: { is_default_billing: "desc" }, // Trier pour avoir l'adresse principale en premier
        });

        return addresses;
    }

    // Récupérer une adresse spécifique d'un utilisateur par id
    static async getAddressById(userId: string, addressId: string) {
        const address = await prisma.address.findFirst({
            where: {
                id_user: parseInt(userId),
                id_address: parseInt(addressId), // On cherche l'adresse par son ID
            },
        });

        return address;
    }

    // Méthode pour créer une nouvelle adresse
    static async createAddress(userId: string, data: any) {
        try {
            console.log("REPO - Données envoyées à Prisma:", data);
            const newAddress = await prisma.address.create({
                data: {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    address1: data.address1,
                    address2: data.address2 || null,
                    postal_code: data.postal_code,
                    city: data.city,
                    region: data.region,
                    country: data.country,
                    mobile_phone: data.mobile_phone,
                    is_default_billing: !!data.is_default_billing,
                    is_default_shipping: !!data.is_default_shipping,
                    id_user: parseInt(userId),
                },
            });

            return newAddress;
        } catch (error) {
            console.error("Erreur Prisma:", error);
            throw error; // Pour continuer la propagation si nécessaire
        }
    }

    // Mettre à jour une adresse spécifique d'un utilisateur
    static async updateAddress(userId: string, addressId: string, data: any) {
        const updatedAddress = await prisma.address.update({
            where: {
                id_address: parseInt(addressId), // Trouver l'adresse par son ID
            },
            data: {
                first_name: data.first_name,
                last_name: data.last_name,
                address1: data.address1,
                address2: data.address2,
                postal_code: data.postal_code,
                city: data.city,
                region: data.region,
                country: data.country,
                mobile_phone: data.mobile_phone,
                is_default_billing: !!data.is_default_billing,
                is_default_shipping: !!data.is_default_shipping,
            },
        });

        return updatedAddress;
    }

    static async deleteAddress(userId: string, addressId: string) {
        return await prisma.address.delete({
            where: {
                id_address: parseInt(addressId),
            },
        })
    }

}
