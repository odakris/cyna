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
            city: address.city || "",
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
                region: address.region || "",
                country: address.country,
                mobile_phone: address.mobile_phone,
                is_default_billing: address.is_default_billing,
                is_default_shipping: address.is_default_shipping,
            };
        } catch (error) {
            console.error("[AddressService getUserAddressById] Erreur lors de la récupération de l'adresse:", error);
            throw new Error("Erreur de récupération de l'adresse");
        }
    }

    // Méthode pour créer une nouvelle adresse
    static async createAddress(userId: string, data: any) {
        try {
            const userIdNum = parseInt(userId, 10);
            if (isNaN(userIdNum)) {
                console.error("[AddressService createAddress] ID utilisateur invalide:", { userId });
                throw new Error("ID utilisateur invalide");
            }

            // Préparer les données pour inclure la relation user
            const addressData = {
                first_name: data.first_name,
                last_name: data.last_name,
                address1: data.address1,
                address2: data.address2 || null,
                postal_code: data.postal_code,
                city: data.city,
                country: data.country,
                region: data.region || null,
                mobile_phone: data.mobile_phone,
                is_default_billing: !!data.is_default_billing,
                is_default_shipping: !!data.is_default_shipping,
                user: {
                    connect: { id_user: userIdNum },
                },
            };

            console.log("[AddressService createAddress] Données préparées pour création:", addressData);

            const createdAddress = await AddressRepository.createAddress(userId, addressData);

            if (!createdAddress) {
                console.error("[AddressService createAddress] Création échouée, aucune donnée retournée:", { userId });
                throw new Error("Création échouée, aucune donnée retournée");
            }

            console.log("[AddressService createAddress] Adresse créée:", {
                id_address: createdAddress.id_address,
                userId: userIdNum,
            });

            return createdAddress;
        } catch (error: any) {
            console.error("[AddressService createAddress] Erreur lors de la création:", {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    // Méthode pour mettre à jour une adresse spécifique
    static async updateAddress(userId: string, addressId: string, data: any) {
        try {
            // Validation de la présence des données nécessaires
            const requiredFields = ['first_name', 'last_name', 'address1', 'postal_code', 'city', 'country'];
            const missingFields = requiredFields.filter(field => !data[field]);
            if (missingFields.length > 0) {
                console.error("[AddressService updateAddress] Champs manquants:", { missingFields });
                throw new Error(`Les champs obligatoires sont manquants: ${missingFields.join(", ")}`);
            }

            const userIdNum = parseInt(userId, 10);
            const addressIdNum = parseInt(addressId, 10);
            if (isNaN(userIdNum) || isNaN(addressIdNum)) {
                console.error("[AddressService updateAddress] ID utilisateur ou adresse invalide:", { userId, addressId });
                throw new Error("ID utilisateur ou ID d'adresse invalide");
            }

            // Préparer les données pour la mise à jour
            const addressData = {
                first_name: data.first_name,
                last_name: data.last_name,
                address1: data.address1,
                address2: data.address2 || null,
                postal_code: data.postal_code,
                city: data.city,
                country: data.country,
                region: data.region || null,
                mobile_phone: data.mobile_phone,
                is_default_billing: !!data.is_default_billing,
                is_default_shipping: !!data.is_default_shipping,
            };

            console.log("[AddressService updateAddress] Données préparées pour mise à jour:", addressData);

            const updatedAddress = await AddressRepository.updateAddress(userId, addressId, addressData);

            if (!updatedAddress) {
                console.error("[AddressService updateAddress] Mise à jour échouée, aucune donnée retournée:", { userId, addressId });
                throw new Error("L'adresse n'a pas pu être mise à jour");
            }

            console.log("[AddressService updateAddress] Adresse mise à jour:", {
                id_address: updatedAddress.id_address,
                userId: userIdNum,
            });

            return updatedAddress;
        } catch (error: any) {
            console.error("[AddressService updateAddress] Erreur lors de la mise à jour:", {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    static async deleteAddress(userId: string, addressId: string) {
        try {
            const userIdNum = parseInt(userId, 10);
            const addressIdNum = parseInt(addressId, 10);
            if (isNaN(userIdNum) || isNaN(addressIdNum)) {
                console.error("[AddressService deleteAddress] ID utilisateur ou adresse invalide:", { userId, addressId });
                throw new Error("ID utilisateur ou ID d'adresse invalide");
            }

            const deletedAddress = await AddressRepository.deleteAddress(userId, addressId);

            if (!deletedAddress) {
                console.error("[AddressService deleteAddress] Suppression échouée, aucune donnée retournée:", { userId, addressId });
                throw new Error("L'adresse n'a pas pu être supprimée");
            }

            console.log("[AddressService deleteAddress] Adresse supprimée:", {
                id_address: deletedAddress.id_address,
                userId: userIdNum,
            });

            return deletedAddress;
        } catch (error: any) {
            console.error("[AddressService deleteAddress] Erreur lors de la suppression:", {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}