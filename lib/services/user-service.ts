import { User } from "@prisma/client"
import userRepository from "../repositories/user-repository"
import { UserFormValues } from "../validations/user-schema"

/**
 * Récupère la liste complète des utilisateurs depuis le dépôt de données.
 * @returns {Promise<User[]>} Liste des produits.
 */
export const getAllUsers = async (): Promise<User[]> => {
  return userRepository.findAll()
}

/**
 * Récupère un utilisateur spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<User>} Le produit correspondant avec son URL d'image.
 * @throws {Error} Si le produit n'existe pas.
 */
export const getUserById = async (id: number): Promise<User> => {
  const user = await userRepository.findById(id)

  if (!user) {
    throw new Error("Utilisateur non trouvé")
  }

  return user
}

/**
 * Crée un nouvel utilisateur en base de données.
 * @param {UserFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<User>} Le produit nouvellement créé.
 */
export const createUser = async (data: UserFormValues): Promise<User> => {
  return userRepository.create(data)
}

/**
 * Met à jour un utilisateur existant avec de nouvelles informations.
 * @param {number} id - Identifiant du produit à mettre à jour.
 * @param {UserFormValues} data - Nouvelles données du produit.
 * @returns {Promise<User>} Le produit mis à jour.
 * @throws {Error} Si le produit n'existe pas.
 */
export const updateUser = async (
  id: number,
  data: UserFormValues
): Promise<User> => {
  const exists = await userRepository.exists(id)

  if (!exists) {
    throw new Error("Utilisateur non trouvé")
  }

  return userRepository.update(id, data)
}

/**
 * Supprime un utilisateur existant de la base de données.
 * @param {number} id - Identifiant unique de l'utilisateur à supprimer.
 * @returns {Promise<User>} L'utilisateur supprimé.
 * @throws {Error} Si l'utilisateur n'existe pas.
 */
export const deleteUser = async (id: number): Promise<User> => {
  const exists = await userRepository.exists(id)

  if (!exists) {
    throw new Error("Utilisateur non trouvé")
  }

  return userRepository.remove(id)
}

const userService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
}
export default userService
