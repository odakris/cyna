import { User } from "@prisma/client"
import userRepository from "../repositories/user-repository"
import { UserFormValues } from "../validations/user-schema"

/**
 * Récupère la liste complète des utilisateurs depuis le dépôt de données.
 * @returns {Promise<User[]>} Liste des produits.
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await userRepository.findAll()
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    throw new Error("Erreur lors de la récupération des utilisateurs")
  }
}

/**
 * Récupère un utilisateur spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique du produit.
 * @returns {Promise<User>} Le produit correspondant avec son URL d'image.
 * @throws {Error} Si le produit n'existe pas.
 */
export const getUserById = async (id: number): Promise<User> => {
  try {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new Error("Utilisateur non trouvé")
    }

    return user
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur par ID:",
      error
    )
    throw new Error(`Erreur lors de la récupération de l'utilisateur ${id}`)
  }
}

/**
 * Récupère un utilisateur spécifique en fonction de son email.
 * @param {string} email - Email de l'utilisateur.
 * @returns {Promise<User>} L'utilisateur correspondant.
 * @throws {UserServiceError} Si l'utilisateur n'existe pas ou en cas d'erreur.
 */
export const getUserByEmail = async (email: string): Promise<User> => {
  try {
    const user = await userRepository.findByEmail(email)

    if (!user) {
      throw new Error(`Aucun utilisateur trouvé avec l'email: ${email}`)
    }

    return user
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'utilisateur par email:",
      error
    )
    throw new Error(`Erreur lors de la récupération de l'utilisateur par email`)
  }
}

/**
 * Crée un nouvel utilisateur en base de données.
 * @param {UserFormValues} data - Données du produit à enregistrer.
 * @returns {Promise<User>} Le produit nouvellement créé.
 */
export const createUser = async (data: UserFormValues): Promise<User> => {
  try {
    // Vérifier si un utilisateur avec le même email existe déjà
    const existingUser = await userRepository.findByEmail(data.email.trim())

    if (existingUser) {
      throw new Error(
        `Un utilisateur avec l'email ${data.email.trim()} existe déjà`
      )
    }

    return await userRepository.create(data)
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur spécifique concernant un email déjà utilisé
      if (
        error.message.includes("existe déjà") ||
        (error.message.includes("mot de passe") &&
          error.message.includes("requis"))
      ) {
        throw new Error(error.message)
      }
    }

    throw new Error("Erreur lors de la création de l'utilisateur")
  }
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
  try {
    // Vérifier si l'utilisateur existe
    const exists = await userRepository.exists(id)

    if (!exists) {
      throw new Error("Utilisateur non trouvé")
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (data.email) {
      const existingUser = await userRepository.findByEmail(data.email.trim())
      if (existingUser && existingUser.id_user !== id) {
        throw new Error(
          `Un autre utilisateur utilise déjà l'email ${data.email.trim()}`
        )
      }
    }

    return await userRepository.update(id, data)
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur spécifique concernant un email déjà utilisé
      if (
        error.message.includes("utilise déjà") ||
        error.message.includes("n'existe pas")
      ) {
        throw new Error(error.message)
      }
    }

    throw new Error(`Erreur lors de la mise à jour de l'utilisateur ${id}`)
  }
}

/**
 * Supprime un utilisateur existant de la base de données.
 * @param {number} id - Identifiant unique de l'utilisateur à supprimer.
 * @returns {Promise<User>} L'utilisateur supprimé.
 * @throws {Error} Si l'utilisateur n'existe pas.
 */
export const deleteUser = async (id: number): Promise<object> => {
  try {
    // Vérifier si l'utilisateur existe
    const exists = await userRepository.exists(id)

    if (!exists) {
      throw new Error("Utilisateur non trouvé")
    }

    await userRepository.remove(id)
    return { success: true, message: "Utilisateur supprimé avec succès" }
  } catch (error) {
    if (error instanceof Error) {
      // Si c'est une erreur spécifique concernant des commandes associées
      if (
        error.message.includes("commande") ||
        error.message.includes("possède")
      ) {
        throw new Error(
          `Impossible de supprimer l'utilisateur car il possède des commandes associées`
        )
      }

      // Si l'utilisateur n'existe pas
      if (error.message.includes("n'existe pas")) {
        throw new Error(error.message)
      }
    }

    throw new Error(`Erreur lors de la suppression de l'utilisateur ${id}`)
  }
}

const userService = {
  getAllUsers,
  getUserById,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
}
export default userService
