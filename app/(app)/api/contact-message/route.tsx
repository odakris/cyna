// app/api/contact-message/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import contactMessageController from "@/lib/controllers/contact-message-controller"

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)

    // Optionnel: restreindre l'accès aux administrateurs
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    // Filtrer par messages non lus si spécifié
    const unreadOnly = request.nextUrl.searchParams.get("unread") === "true"

    if (unreadOnly) {
      return await contactMessageController.getUnread()
    }

    return await contactMessageController.getAll()
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    return await contactMessageController.create(request)
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
