import { prisma } from "@/lib/prisma"
import { UserFormValues } from "@/lib/validations/user-schema"
import { User } from "@prisma/client"
import { TransactionClient } from "../../types/Types"

/**
 * Récupère la liste complète des utilisateurs.
 * @returns {Promise<User[]>} Liste des produits triés par ordre de priorité.
 */
export const findAll = async (): Promise<User[]> => {
  try {
    return prisma.user.findMany({
      include: {
        orders: true,
      },
      orderBy: {
        id_user: "desc",
      },
    })
  } catch (error) {
    // console.error("Impossible de récupérer la liste des utilisateurs:", error)
    throw new Error("Impossible de récupérer la liste des utilisateurs")
  }
}

/**
 * Récupère un utilisateur spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<User | null>} Le produit correspondant ou null s'il n'existe pas.
 */
export const findById = async (id: number): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { id_user: id },
      include: { orders: true },
    })
  } catch (error) {
    // console.error("Impossible de récupérer l'utilisateur:", error)
    throw new Error(`Impossible de récupérer l'utilisateur avec l'ID ${id}`)
  }
}

/**
 * Recherche un utilisateur par son adresse email.
 * @param {string} email - Adresse email de l'utilisateur.
 * @returns {Promise<User | null>} L'utilisateur correspondant ou null s'il n'existe pas.
 * @throws {UserError} En cas d'erreur lors de la recherche de l'utilisateur.
 */
export const findByEmail = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    })
  } catch (error) {
    // console.error("Impossible de récupérer l'utilisateur:", error)
    throw new Error(
      `Impossible de trouver un utilisateur avec l'email ${email}`
    )
  }
}

/**
 * Crée un nouvel utilisateur en base de données.
 * @param {UserFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<User>} Le produit nouvellement créé.
 */
export const create = async (data: UserFormValues): Promise<User> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si un utilisateur avec le même email existe déjà
      const existingUser = await tx.user.findUnique({
        where: { email: data.email.trim() },
      })

      if (existingUser) {
        throw new Error(
          `EMAIL_EXISTS:Un utilisateur avec l'email '${data.email.trim()}' existe déjà`
        )
      }

      return await tx.user.create({
        data: {
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim(),
          password: data.password || "",
          role: data.role,
          email_verified: data.email_verified,
          two_factor_enabled: data.two_factor_enabled,
          active: data.active,
          created_at: new Date(),
          updated_at: new Date(),
        },
      })
    })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("EMAIL_EXISTS:")) {
      throw error
    }
    // console.error("Impossible de créer l'utilisateur:", error)
    throw new Error("Impossible de créer l'utilisateur")
  }
}

/**
 * Met à jour un utilisateur existant en base de données.
 * @param {number} id - Identifiant unique de l'utilisateur à mettre à jour.
 * @param {UserFormValues} data - Nouvelles données de l'utilisateur.
 * @returns {Promise<User>} L'utilisateur mis à jour.
 */
export const update = async (
  id: number,
  data: UserFormValues
): Promise<User> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si l'utilisateur existe
      const userExists = await tx.user.findUnique({
        where: { id_user: id },
      })

      if (!userExists) {
        throw new Error(`L'utilisateur avec l'ID ${id} n'existe pas`)
      }

      // Vérifier si un autre utilisateur utilise déjà cet email
      const duplicateEmail = await tx.user.findFirst({
        where: {
          email: data.email.trim(),
          id_user: { not: id },
        },
      })

      if (duplicateEmail) {
        throw new Error(
          `Un autre utilisateur utilise déjà l'email '${data.email.trim()}'`
        )
      }

      return await tx.user.update({
        where: { id_user: id },
        data: {
          first_name: data.first_name.trim(),
          last_name: data.last_name.trim(),
          email: data.email.trim(),
          password: data.password ?? userExists.password ?? "",
          role: data.role,
          email_verified: data.email_verified,
          two_factor_enabled: data.two_factor_enabled,
          active: data.active,
          updated_at: new Date(),
        },
      })
    })
  } catch (error) {
    // console.error("Impossible de mettre à jour l'utilisateur:", error)
    throw new Error(`Impossible de mettre à jour l'utilisateur avec l'ID ${id}`)
  }
}

/**
 * Supprime un utilisateur de la base de données.
 * @param {number} id - Identifiant unique de l'utilisateur à supprimer.
 * @returns {Promise<User>} L'utilisateur supprimé.
 */
export const remove = async (id: number): Promise<User> => {
  try {
    return await prisma.$transaction(async (tx: TransactionClient) => {
      // Vérifier si l'utilisateur existe
      const user = await tx.user.findUnique({
        where: { id_user: id },
        include: { orders: true },
      })

      if (!user) {
        throw new Error(`L'utilisateur avec l'ID ${id} n'existe pas`)
      }

      // Vérifier si l'utilisateur a des commandes associées
      if (user.orders.length > 0) {
        throw new Error(
          `Impossible de supprimer l'utilisateur car il possède ${user.orders.length} commande(s)`
        )
      }

      return await tx.user.delete({
        where: { id_user: id },
      })
    })
  } catch (error) {
    // console.error("Impossible de supprimer l'utilisateur:", error)
    throw new Error(`Impossible de supprimer l'utilisateur avec l'ID ${id}`)
  }
}

/**
 * Vérifie si un produit existe en base de données.
 * @param {number} id - Identifiant du produit à vérifier.
 * @returns {Promise<boolean>} Retourne true si le produit existe, sinon false.
 */
export const exists = async (id: number): Promise<boolean> => {
  try {
    const count = await prisma.user.count({
      where: { id_user: id },
    })
    return count > 0
  } catch (error) {
    // console.error("Impossible de vérifier l'existence de l'utilisateur:", error)
    throw new Error(
      `Impossible de vérifier l'existence de l'utilisateur avec l'ID ${id}`
    )
  }
}

/**
 * Met à jour uniquement le statut actif d'un produit.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @param {boolean} active - Le nouveau statut actif du produit.
 * @returns {Promise<User>} Le produit mis à jour.
 */
export const updateActiveStatus = async (
  id: number,
  active: boolean
): Promise<User> => {
  try {
    return await prisma.user.update({
      where: { id_user: id },
      data: {
        active,
        updated_at: new Date(),
      },
    })
  } catch (error) {
    // console.error("Erreur lors de la mise à jour du statut actif:", error)
    throw error
  }
}

/**
 * Dépôt de données (repository) pour la gestion des utilisateurs.
 */
const userRepository = {
  findAll,
  findById,
  findByEmail,
  create,
  update,
  remove,
  exists,
  updateActiveStatus,
}
export default userRepository
