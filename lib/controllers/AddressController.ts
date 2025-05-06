import { NextRequest, NextResponse } from "next/server";
import { AddressService } from "@/lib/services/addressService";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../app/(app)/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Middleware pour vérifier l'authentification
async function withAuth(
  req: NextRequest,
  userId: number,
  handler: (userId: number, ...args: any) => Promise<NextResponse>,
  ...handlerArgs: any
) {
  try {
    console.log("[AddressController withAuth] Vérification de la session pour userId:", userId);
    const session = await getServerSession(authOptions);
    console.log("[AddressController withAuth] Session récupérée:", {
      sessionExists: !!session,
      userIdInSession: session?.user?.id_user,
      cookies: req.cookies.get("next-auth.session-token")?.value ? "present" : "absent",
    });

    if (!session?.user?.id_user) {
      console.error("[AddressController withAuth] Session manquante ou utilisateur non connecté", { userId });
      return NextResponse.json(
        { message: "Non authentifié. Veuillez vous connecter." },
        { status: 401 }
      );
    }

    const sessionUserId = parseInt(session.user.id_user);
    if (isNaN(sessionUserId) || sessionUserId !== userId) {
      console.error("[AddressController withAuth] Utilisateur non autorisé", {
        sessionUserId: session.user.id_user,
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

        if (addresses.length === 0) {
          console.log("[AddressController getUserAddresses] Aucune adresse trouvée pour userId:", userId);
          return NextResponse.json(
            { message: "Aucune adresse trouvée" },
            { status: 404 }
          );
        }

        console.log("[AddressController getUserAddresses] Adresses récupérées:", { userId, count: addresses.length });
        return NextResponse.json(addresses, { status: 200 });
      } catch (error) {
        console.error("[AddressController getUserAddresses] Erreur lors de la récupération:", error);
        return NextResponse.json(
          { message: "Erreur serveur lors de la récupération des adresses" },
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

        if (!address) {
          console.log("[AddressController getUserAddressById] Adresse non trouvée:", { userId, addressId });
          return NextResponse.json(
            { message: "Adresse non trouvée" },
            { status: 404 }
          );
        }

        console.log("[AddressController getUserAddressById] Adresse récupérée:", { userId, addressId });
        return NextResponse.json(address, { status: 200 });
      } catch (error) {
        console.error("[AddressController getUserAddressById] Erreur lors de la récupération:", error);
        return NextResponse.json(
          { message: "Erreur serveur lors de la récupération de l'adresse" },
          { status: 500 }
        );
      }
    });
  }

  static async createAddress(req: NextRequest, userId: string, data: any) {
    const id = parseInt(userId, 10);
    if (isNaN(id) || !data) {
      console.error("[AddressController createAddress] ID utilisateur ou données manquantes", { userId, data });
      return NextResponse.json(
        { message: "ID utilisateur et données requises" },
        { status: 400 }
      );
    }

    return withAuth(req, id, async (userId: number) => {
      console.log("[AddressController createAddress] Création d'adresse pour userId:", userId);
      console.log("[AddressController createAddress] Données:", data);

      try {
        const created = await AddressService.createAddress(userId.toString(), data);

        if (!created) {
          console.error("[AddressController createAddress] Création échouée, aucune donnée retournée", { userId });
          throw new Error("Création échouée, aucune donnée retournée");
        }

        console.log("[AddressController createAddress] Adresse créée:", { userId, addressId: created.id_address });
        return NextResponse.json(created, { status: 201 });
      } catch (error) {
        console.error("[AddressController createAddress] Erreur lors de la création:", error);
        return NextResponse.json(
          { message: "Erreur serveur lors de la création de l'adresse" },
          { status: 500 }
        );
      }
    }, data);
  }

  static async updateAddress(req: NextRequest, id: string, id_address: string, data: any) {
    const userId = parseInt(id, 10);
    const addressId = parseInt(id_address, 10);
    if (isNaN(userId) || isNaN(addressId) || !data) {
      console.error("[AddressController updateAddress] ID utilisateur, ID adresse ou données manquantes", { id, id_address, data });
      return NextResponse.json(
        { message: "ID utilisateur, ID d'adresse et données requis" },
        { status: 400 }
      );
    }

    return withAuth(req, userId, async (userId: number) => {
      try {
        const updatedAddress = await AddressService.updateAddress(userId.toString(), id_address, data);
        if (!updatedAddress) {
          console.log("[AddressController updateAddress] Adresse non trouvée:", { userId, addressId });
          return NextResponse.json(
            { message: "Adresse non trouvée" },
            { status: 404 }
          );
        }

        console.log("[AddressController updateAddress] Adresse mise à jour:", { userId, addressId });
        return NextResponse.json(updatedAddress, { status: 200 });
      } catch (error) {
        console.error("[AddressController updateAddress] Erreur lors de la mise à jour:", error);
        return NextResponse.json(
          { message: "Erreur serveur lors de la mise à jour de l'adresse" },
          { status: 500 }
        );
      }
    }, id_address, data);
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
      } catch (error) {
        console.error("[AddressController deleteAddress] Erreur lors de la suppression:", error);
        return NextResponse.json(
          { message: "Erreur serveur lors de la suppression de l'adresse" },
          { status: 500 }
        );
      }
    }, addressId);
  }
}