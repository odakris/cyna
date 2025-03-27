import { prisma } from "@/lib/prisma"
import { UserFormValues } from "@/lib/validations/user-schema"
import { User } from "@prisma/client"

/**
 * Récupère la liste complète des utilisateurs.
 * @returns {Promise<User[]>} Liste des produits triés par ordre de priorité.
 */
export const findAll = async (): Promise<User[]> => {
  return prisma.user.findMany({
    include: {
      orders: true,
    },
    orderBy: {
      id_user: "desc",
    },
  })
}

/**
 * Récupère un utilisateur spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<User | null>} Le produit correspondant ou null s'il n'existe pas.
 */
export const findById = async (id: number): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id_user: id },
    include: { orders: true },
  })
}

/**
 * Crée un nouvel utilisateur en base de données.
 * @param {UserFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<User>} Le produit nouvellement créé.
 */
export const create = async (data: UserFormValues): Promise<User> => {
  return prisma.user.create({
    data: {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role,
      email_verified: data.email_verified,
      two_factor_enabled: data.two_factor_enabled,
      created_at: new Date(),
      updated_at: new Date(),
    },
  })
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
  return prisma.user.update({
    where: { id_user: id },
    data: {
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim(),
      password: data.password,
      role: data.role,
      email_verified: data.email_verified,
      two_factor_enabled: data.two_factor_enabled,
      updated_at: new Date(),
    },
  })
}

/**
 * Supprime un utilisateur de la base de données.
 * @param {number} id - Identifiant unique de l'utilisateur à supprimer.
 * @returns {Promise<User>} L'utilisateur supprimé.
 */
export const remove = async (id: number): Promise<User> => {
  return prisma.user.delete({
    where: { id_user: id },
  })
}

/**
 * Vérifie si un produit existe en base de données.
 * @param {number} id - Identifiant du produit à vérifier.
 * @returns {Promise<boolean>} Retourne true si le produit existe, sinon false.
 */
export const exists = async (id: number): Promise<boolean> => {
  const count = await prisma.user.count({
    where: { id_user: id },
  })
  return count > 0
}

/**
 * Dépôt de données (repository) pour la gestion des utilisateurs.
 */
const userRepository = {
  findAll,
  findById,
  create,
  update,
  remove,
  exists,
}
export default userRepository
