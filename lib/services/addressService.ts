import { AddressRepository } from "../repositories/AddressRepository";

export class AddressService {
    // Méthode pour récupérer toutes les adresses d'un utilisateur
    static async getUserAddresses(userId: string) {
        const addresses = await AddressRepository.getAddressesByUserId(userId);

        if (!addresses || addresses.length === 0) {
            return [];
        }

        return addresses.map(address => ({
            id_address: address.id_address,
            first_name: address.first_name,
            last_name: address.last_name,
            address1: address.address1,
            address2: address.address2 || "",
            postal_code: address.postal_code,
            city: address.city,
            region: address.region,
            country: address.country,
            mobile_phone: address.mobile_phone,
            is_default_billing: address.is_default_billing,
            is_default_shipping: address.is_default_shipping,
        }));
    }

    // Méthode pour récupérer une adresse spécifique par ID
    static async getUserAddressById(userId: string, addressId: string) {
        try {
            // Appel au repository pour récupérer une adresse spécifique
            const address = await AddressRepository.getAddressById(userId, addressId);

            // Si l'adresse n'est pas trouvée, retourner null
            if (!address) {
                return null;
            }

            // Mappe l'adresse pour la renvoyer avec les informations pertinentes
            return {
                id_address: address.id_address,
                first_name: address.first_name,
                last_name: address.last_name,
                address1: address.address1,
                address2: address.address2 || "",
                postal_code: address.postal_code,
                city: address.city,
                region: address.region,
                country: address.country,
                mobile_phone: address.mobile_phone,
                is_default_billing: address.is_default_billing,
                is_default_shipping: address.is_default_shipping,
            };
        } catch (error) {
            console.error("Erreur lors de la récupération de l'adresse spécifique :", error);
            throw new Error("Erreur de récupération de l'adresse");
        }
    }

    // Méthode pour créer une nouvelle adresse
    static async createAddress(userId: string, data: any) {
        return await AddressRepository.createAddress(userId, data);
    }

    // Nouvelle méthode pour mettre à jour une adresse spécifique
    static async updateAddress(userId: string, addressId: string, data: any) {
        // Validation de la présence des données nécessaires
        if (!data || !data.first_name || !data.last_name || !data.address1 || !data.postal_code || !data.city || !data.country) {
            throw new Error("Les données obligatoires sont manquantes");
        }

        // Appel à la méthode du repository pour effectuer la mise à jour
        const updatedAddress = await AddressRepository.updateAddress(userId, addressId, data);

        if (!updatedAddress) {
            throw new Error("L'adresse n'a pas pu être mise à jour");
        }

        return updatedAddress;
    }

    static async deleteAddress(userId: string, addressId: string) {
        return await AddressRepository.deleteAddress(userId, addressId)
    }

}
