import { NextRequest, NextResponse } from "next/server"
import userService from "@/lib/services/user-service"
import { userFormSchema } from "@/lib/validations/user-schema"
import { ZodError } from "zod"

/**
 * Récupère la liste complète des utilisateurs depuis la base de données.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la liste des utilisateurs ou une erreur serveur.
 */
export const getAll = async (): Promise<NextResponse> => {
  try {
    const users = await userService.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    // console.error("Erreur lors de la récupération des utilisateurs:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Récupère un utilisateur spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de l'utilisateur.
 * @returns {Promise<NextResponse>} Réponse JSON contenant l'utilisateur ou un message d'erreur.
 */
export const getById = async (id: number): Promise<NextResponse> => {
  try {
    const user = await userService.getUserById(id)
    return NextResponse.json(user)
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération de l'utilisateur par ID:",
      error
    )*/

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const getByEmail = async (email: string): Promise<NextResponse> => {
  try {
    const user = await userService.getUserByEmail(email)
    return NextResponse.json(user)
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération de l'utilisateur par email:",
      error
    )*/

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Crée un nouvel utilisateur en validant les données reçues.
 * @param {NextRequest} request - Requête contenant les données de l'utilisateur.
 * @returns {Promise<NextResponse>} Réponse JSON avec l'utilisateur créé ou une erreur de validation.
 */
export const create = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = userFormSchema.parse(body)
    const newUser = await userService.createUser(data)
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    // console.error("Erreur lors de la création de l'utilisateur:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      // Traiter les erreurs spécifiques pour préserver leur contexte
      if (error.message.startsWith("EMAIL_EXISTS:")) {
        // Extraire le message réel après le code
        const actualMessage = error.message.split(":")[1]
        return NextResponse.json(
          { error: actualMessage, code: "EMAIL_EXISTS" },
          { status: 400 }
        )
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

/**
 * Met à jour un utilisateur existant avec de nouvelles données.
 * @param {NextRequest} request - Requête contenant les nouvelles données de l'utilisateur.
 * @param {number} id - Identifiant de l'utilisateur à mettre à jour.
 * @returns {Promise<NextResponse>} Réponse JSON avec l'utilisateur mis à jour ou une erreur de validation.
 */
export const update = async (
  request: NextRequest,
  id: number
): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = userFormSchema.parse(body)
    const updatedUser = await userService.updateUser(id, data)
    return NextResponse.json(updatedUser)
  } catch (error) {
    // console.error("Erreur lors de la mise à jour de l'utilisateur:", error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * Supprime un utilisateur de la base de données.
 * @param {number} id - Identifiant unique de l'utilisateur à supprimer.
 * @returns {Promise<NextResponse>} Réponse JSON avec un message de confirmation ou une erreur.
 */
export const remove = async (id: number): Promise<NextResponse> => {
  try {
    const result = await userService.deleteUser(id)
    return NextResponse.json(result)
  } catch (error) {
    // console.error("Erreur lors de la suppression de l'utilisateur:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Active ou désactive un utilisateur.
 * @param {number} id - Identifiant du utilisateur à modifier.
 * @returns {Promise<NextResponse>} La réponse avec le statut mis à jour ou un message d'erreur.
 */
export const toggleUserStatus = async (id: number): Promise<NextResponse> => {
  try {
    const result = await userService.toggleUserStatus(id)

    // Si l'activation a été bloquée
    if (result.blocked) {
      return NextResponse.json(
        {
          active: result.user.active,
          blocked: true,
          reason: result.reason,
        },
        { status: 422 }
      )
    }

    // Sinon renvoyer l'utilisateur mis à jour
    return NextResponse.json(result.user)
  } catch (error) {
    // console.error("Erreur lors du changement de statut l'utilisateur", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Produit non trouvé" ? 404 : 400 }
      )
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

const userController = {
  getAll,
  getById,
  create,
  update,
  remove,
  toggleUserStatus,
}
export default userController
