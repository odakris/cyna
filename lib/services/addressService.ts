import { AddressRepository } from "../repositories/AddressRepository";

export class AddressService {
    static async getUserAddresses(userId: string) {
        const addresses = await AddressRepository.getAddressesByUserId(userId);
        // console.log("Fetched addresses:", addresses);

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
}
