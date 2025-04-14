// app/api/contact-message/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import contactMessageController from "@/lib/controllers/contact-message-controller"
import { validateId } from "../../../../../lib/utils/utils"

// app/api/contact-message/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification et les permissions pour les admin seulement
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  try {
    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (id === null || isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    return await contactMessageController.getById(id)
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification et les permissions pour les admin seulement
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  try {
    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (id === null || isNaN(id)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 })
    }

    return await contactMessageController.remove(id)
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
