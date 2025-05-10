import { NextRequest, NextResponse } from "next/server";
import { AddressService } from "@/lib/services/addressService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/(app)/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/utils/encryption";

// Middleware pour vérifier l'authentification
async function withAuth(
  req: NextRequest,
  userId: number,
  handler: (userId: number, ...args: any) => Promise<NextResponse>,
  ...handlerArgs: any
) {
  try {
    console.log("[AddressController withAuth] Vérification pour userId:", userId);
    const session = await getServerSession(authOptions);
    const xUserId = req.headers.get("x-user-id");

    if (!session?.user?.id_user && !xUserId) {
      console.error("[AddressController withAuth] Aucune session ou x-user-id", { userId });
      return NextResponse.json(
        { message: "Non authentifié. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const sessionUserId = session?.user?.id_user ? parseInt(session.user.id_user) : null;
    const headerUserId = xUserId ? parseInt(xUserId) : null;

    if (
      (sessionUserId && isNaN(sessionUserId)) ||
      (headerUserId && isNaN(headerUserId)) ||
      (sessionUserId && sessionUserId !== userId) ||
      (headerUserId && headerUserId !== userId)
    ) {
      console.error("[AddressController withAuth] Utilisateur non autorisé", {
        sessionUserId,
        headerUserId,
        requestedUserId: userId,
      });
      return NextResponse.json(
        { message: "Non autorisé. Vous ne pouvez pas accéder aux données d'un autre utilisateur." },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id_user: userId },
      select: { id_user: true },
    });
    if (!user) {
      console.error("[AddressController withAuth] Utilisateur non trouvé", { userId });
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    console.log("[AddressController withAuth] Authentification réussie pour userId:", userId);
    return await handler(userId, ...handlerArgs);
  } catch (error: any) {
    console.error("[AddressController withAuth] Erreur", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

export class AddressController {
  static async getUserAddresses(req: NextRequest, id: string) {
    const userId = parseInt(id, 10);
    if (isNaN(userId)) {
      console.error("[AddressController getUserAddresses] ID utilisateur invalide", { id });
      return NextResponse.json(
        { message: "ID utilisateur invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const addresses = await AddressService.getUserAddresses(userId.toString());
        console.log("[AddressController getUserAddresses] Adresses brutes:", addresses);

        if (addresses.length === 0) {
          console.log("[AddressController getUserAddresses] Aucune adresse trouvée pour userId:", userId);
          return NextResponse.json([], { status: 200 });
        }

        // Déchiffrer les champs sensibles
        const decryptedAddresses = addresses.map(address => {
          const decryptedAddress: any = { ...address };

          const fields = [
            'first_name',
            'last_name',
            'address1',
            'postal_code',
            'city',
            'country',
            'mobile_phone',
            ...(address.address2 ? ['address2'] : []),
            ...(address.region ? ['region'] : []),
          ];

          for (const field of fields) {
            try {
              decryptedAddress[field] = decrypt(address[field], field === 'postal_code');
            } catch (error) {
              console.error(`[AddressController getUserAddresses] Échec du déchiffrement du champ ${field} pour addressId: ${address.id_address}`, { value: address[field] });
              throw error;
            }
          }

          return decryptedAddress;
        });

        console.log("[AddressController getUserAddresses] Adresses déchiffrées:", { userId, count: decryptedAddresses.length });
        return NextResponse.json(decryptedAddresses, { status: 200 });
      } catch (error: any) {
        console.error("[AddressController getUserAddresses] Erreur lors de la récupération:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la récupération des adresses: ${error.message}` },
          { status: 500 }
        );
      }
    });
  }

  static async getUserAddressById(req: NextRequest, id: string, id_address: string) {
    const userId = parseInt(id, 10);
    const addressId = parseInt(id_address, 10);
    if (isNaN(userId) || isNaN(addressId)) {
      console.error("[AddressController getUserAddressById] ID utilisateur ou adresse invalide", { id, id_address });
      return NextResponse.json(
        { message: "ID utilisateur ou ID d'adresse invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const address = await AddressService.getUserAddressById(userId.toString(), id_address);
        console.log("[AddressController getUserAddressById] Adresse brute:", address);

        if (!address) {
          console.log("[AddressController getUserAddressById] Adresse non trouvée:", { userId, addressId });
          return NextResponse.json(
            { message: "Adresse non trouvée" },
            { status: 404 }
          );
        }

        const decryptedAddress: any = { ...address };
        const fields = [
          'first_name',
          'last_name',
          'address1',
          'postal_code',
          'city',
          'country',
          'mobile_phone',
          ...(address.address2 ? ['address2'] : []),
          ...(address.region ? ['region'] : []),
        ];

        for (const field of fields) {
          try {
            decryptedAddress[field] = decrypt(address[field], field === 'postal_code');
          } catch (error) {
            console.error(`[AddressController getUserAddressById] Échec du déchiffrement du champ ${field} pour addressId: ${addressId}`, { value: address[field] });
            throw error;
          }
        }

        console.log("[AddressController getUserAddressById] Adresse déchiffrée:", { userId, addressId });
        return NextResponse.json(decryptedAddress, { status: 200 });
      } catch (error: any) {
        console.error("[AddressController getUserAddressById] Erreur lors de la récupération:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la récupération de l'adresse: ${error.message}` },
          { status: 500 }
        );
      }
    });
  }

  static async createAddress(req: NextRequest, userId: string) {
    const id = parseInt(userId, 10);
    const data = await req.json();
    if (isNaN(id) || !data) {
      console.error("[AddressController createAddress] ID utilisateur ou données manquantes", { userId, data });
      return NextResponse.json(
        { message: "ID utilisateur et données requises" },
        { status: 400 }
      );
    }

    return withAuth(req, id, async (userId: number) => {
      console.log("[AddressController createAddress] Création d'adresse pour userId:", userId);
      console.log("[AddressController createAddress] Données reçues:", data);

      try {
        // Valider les champs requis et les longueurs
        const requiredFields = ['first_name', 'last_name', 'address1', 'postal_code', 'city', 'country', 'mobile_phone'];
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
          console.error("[AddressController createAddress] Champs manquants:", { missingFields });
          return NextResponse.json(
            { message: `Champs manquants: ${missingFields.join(", ")}` },
            { status: 400 }
          );
        }

        const maxLengths = {
          first_name: 50,
          last_name: 50,
          address1: 80,
          address2: 50,
          postal_code: 10,
          city: 50,
          region: 50,
          country: 50,
          mobile_phone: 50,
        };
        for (const [field, maxLength] of Object.entries(maxLengths)) {
          if (data[field] && typeof data[field] === 'string' && data[field].length > maxLength) {
            console.error(`[AddressController createAddress] Champ ${field} trop long`, {
              length: data[field].length,
              maxLength,
            });
            return NextResponse.json(
              { message: `Le champ ${field} ne doit pas dépasser ${maxLength} caractères` },
              { status: 400 }
            );
          }
        }

        // Chiffrer les champs sensibles
        const encryptedData = {
          ...data,
          first_name: encrypt(data.first_name),
          last_name: encrypt(data.last_name),
          address1: encrypt(data.address1),
          address2: data.address2 ? encrypt(data.address2) : null,
          postal_code: encrypt(data.postal_code, true),
          city: encrypt(data.city),
          region: data.region ? encrypt(data.region) : null,
          country: encrypt(data.country),
          mobile_phone: encrypt(data.mobile_phone),
        };

        console.log("[AddressController createAddress] Données chiffrées:", encryptedData);

        // Valider la longueur chiffrée de postal_code
        if (encryptedData.postal_code.length > 80) {
          console.error("[AddressController createAddress] postal_code chiffré trop long", {
            length: encryptedData.postal_code.length,
            maxLength: 80,
          });
          return NextResponse.json(
            { message: "Le code postal chiffré dépasse la limite de 80 caractères" },
            { status: 400 }
          );
        }

        const created = await AddressService.createAddress(userId.toString(), encryptedData);

        if (!created) {
          console.error("[AddressController createAddress] Création échouée, aucune donnée retournée", { userId });
          throw new Error("Création échouée, aucune donnée retournée");
        }

        // Déchiffrer pour la réponse
        const decryptedAddress = {
          ...created,
          first_name: data.first_name,
          last_name: data.last_name,
          address1: data.address1,
          address2: data.address2 || null,
          postal_code: data.postal_code,
          city: data.city,
          region: data.region || null,
          country: data.country,
          mobile_phone: data.mobile_phone,
        };

        console.log("[AddressController createAddress] Adresse créée:", { userId, addressId: created.id_address });
        return NextResponse.json(decryptedAddress, { status: 201 });
      } catch (error: any) {
        console.error("[AddressController createAddress] Erreur lors de la création:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la création de l'adresse: ${error.message}` },
          { status: 500 }
        );
      }
    });
  }

  static async updateAddress(req: NextRequest, id: string, id_address: string) {
    const userId = parseInt(id, 10);
    const addressId = parseInt(id_address, 10);
    const data = await req.json();
    if (isNaN(userId) || isNaN(addressId) || !data) {
      console.error("[AddressController updateAddress] ID utilisateur, ID adresse ou données manquantes", { id, id_address, data });
      return NextResponse.json(
        { message: "ID utilisateur, ID d'adresse et données requis" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        // Valider les champs requis et les longueurs
        const requiredFields = ['first_name', 'last_name', 'address1', 'postal_code', 'city', 'country', 'mobile_phone'];
        const missingFields = requiredFields.filter(field => !data[field]);
        if (missingFields.length > 0) {
          console.error("[AddressController updateAddress] Champs manquants:", { missingFields });
          return NextResponse.json(
            { message: `Champs manquants: ${missingFields.join(", ")}` },
            { status: 400 }
          );
        }

        const maxLengths = {
          first_name: 50,
          last_name: 50,
          address1: 80,
          address2: 50,
          postal_code: 10,
          city: 50,
          region: 50,
          country: 50,
          mobile_phone: 50,
        };
        for (const [field, maxLength] of Object.entries(maxLengths)) {
          if (data[field] && typeof data[field] === 'string' && data[field].length > maxLength) {
            console.error(`[AddressController updateAddress] Champ ${field} trop long`, {
              length: data[field].length,
              maxLength,
            });
            return NextResponse.json(
              { message: `Le champ ${field} ne doit pas dépasser ${maxLength} caractères` },
              { status: 400 }
            );
          }
        }

        // Chiffrer les champs sensibles
        const encryptedData = {
          ...data,
          first_name: encrypt(data.first_name),
          last_name: encrypt(data.last_name),
          address1: encrypt(data.address1),
          address2: data.address2 ? encrypt(data.address2) : null,
          postal_code: encrypt(data.postal_code, true),
          city: encrypt(data.city),
          region: data.region ? encrypt(data.region) : null,
          country: encrypt(data.country),
          mobile_phone: encrypt(data.mobile_phone),
        };

        console.log("[AddressController updateAddress] Données chiffrées:", encryptedData);

        const updatedAddress = await AddressService.updateAddress(userId.toString(), id_address, encryptedData);
        if (!updatedAddress) {
          console.log("[AddressController updateAddress] Adresse non trouvée:", { userId, addressId });
          return NextResponse.json(
            { message: "Adresse non trouvée" },
            { status: 404 }
          );
        }

        // Déchiffrer pour la réponse
        const decryptedAddress = {
          ...updatedAddress,
          first_name: data.first_name,
          last_name: data.last_name,
          address1: data.address1,
          address2: data.address2 || null,
          postal_code: data.postal_code,
          city: data.city,
          region: data.region || null,
          country: data.country,
          mobile_phone: data.mobile_phone,
        };

        console.log("[AddressController updateAddress] Adresse mise à jour:", { userId, addressId });
        return NextResponse.json(decryptedAddress, { status: 200 });
      } catch (error: any) {
        console.error("[AddressController updateAddress] Erreur lors de la mise à jour:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la mise à jour de l'adresse: ${error.message}` },
          { status: 500 }
        );
      }
    });
  }

  static async deleteAddress(req: NextRequest, userId: string, addressId: string) {
    const id = parseInt(userId, 10);
    const addrId = parseInt(addressId, 10);
    if (isNaN(id) || isNaN(addrId)) {
      console.error("[AddressController deleteAddress] ID utilisateur ou adresse invalide", { userId, addressId });
      return NextResponse.json(
        { message: "ID utilisateur ou ID d'adresse invalide" },
        { status: 400 }
      );
    }

    return withAuth(req, id, async (userId: number) => {
      try {
        const deleted = await AddressService.deleteAddress(userId.toString(), addressId);
        if (!deleted) {
          console.log("[AddressController deleteAddress] Adresse non trouvée:", { userId, addressId });
          return NextResponse.json(
            { message: "Adresse non trouvée" },
            { status: 404 }
          );
        }

        console.log("[AddressController deleteAddress] Adresse supprimée:", { userId, addressId });
        return NextResponse.json(
          { message: "Adresse supprimée avec succès" },
          { status: 200 }
        );
      } catch (error: any) {
        console.error("[AddressController deleteAddress] Erreur lors de la suppression:", error);
        return NextResponse.json(
          { message: `Erreur serveur lors de la suppression de l'adresse: ${error.message}` },
          { status: 500 }
        );
      }
    });
  }
}