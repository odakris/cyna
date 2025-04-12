import { NextRequest, NextResponse } from "next/server"
import userService from "@/lib/services/user-service"
import { userFormSchema } from "@/lib/validations/user-schema"
import { ZodError } from "zod"

/**
 * Récupère la liste complète des produits depuis la base de données.
 * @returns {Promise<NextResponse>} Réponse JSON contenant la liste des produits ou une erreur serveur.
 */
export const getAll = async (): Promise<NextResponse> => {
  try {
    const users = await userService.getAllUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)

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
    console.error(
      "Erreur lors de la récupération de l'utilisateur par ID:",
      error
    )

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
    console.error(
      "Erreur lors de la récupération de l'utilisateur par email:",
      error
    )

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
    console.error("Erreur lors de la création de l'utilisateur:", error)

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
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)

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
    console.error("Erreur lors de la suppression de l'utilisateur:", error)

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const message = error instanceof Error ? error.message : "Erreur inconnue"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

const userController = {
  getAll,
  getById,
  create,
  update,
  remove,
}
export default userController
