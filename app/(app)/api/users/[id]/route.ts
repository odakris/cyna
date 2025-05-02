import { NextRequest, NextResponse } from "next/server"
import { validateId } from "@/lib/utils/utils"
import userController from "@/lib/controllers/user-controller"
import { checkPermission } from "@/lib/api-permissions"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await userController.getById(id)
  } catch (error) {
    console.error(
      `Erreur non gérée dans la route GET /users/${params.then(p => p.id)}:`,
      error
    )
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    // Vérifier la session
    const session = await getServerSession(authOptions)
    console.log("Session reçue dans PUT /api/users/[id]:", session)
    if (!session?.user?.id_user) {
      console.error("Session absente ou utilisateur non identifié")
      return NextResponse.json(
        { error: "Vous devez être connecté" },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur met à jour son propre profil
    console.log(
      "ID utilisateur session:",
      session.user.id_user,
      "ID requis:",
      id
    )
    const isSelfUpdate = session.user.id_user.toString() === id.toString()
    console.log("isSelfUpdate:", isSelfUpdate)

    // Si l'utilisateur n'est pas en train de modifier son propre profil,
    // vérifier la permission users:edit
    if (!isSelfUpdate) {
      const permissionCheck = await checkPermission("users:edit")
      console.log("Vérification users:edit:", permissionCheck)
      if (permissionCheck) return permissionCheck
    } else {
      // Vérifier la permission profile:edit pour CUSTOMER
      console.log("Rôle utilisateur:", session.user.role)
      const permissionCheck = await checkPermission("profile:edit")
      console.log("Vérification profile:edit:", permissionCheck)
      if (permissionCheck) return permissionCheck
    }

    return await userController.update(request, id)
  } catch (error) {
    console.error(
      `Erreur non gérée dans la route PUT /users/${params.then(p => p.id)}:`,
      error
    )
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const permissionCheck = await checkPermission("users:delete")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await userController.remove(id)
  } catch (error) {
    console.error(
      `Erreur non gérée dans la route DELETE /users/${params.then(p => p.id)}:`,
      error
    )
    return NextResponse.json(
      { error: "Erreur serveur inattendue" },
      { status: 500 }
    )
  }
}
