// app/api/contact-message/respond/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import contactMessageController from "@/lib/controllers/contact-message-controller"

export async function POST(request: NextRequest) {
  // Vérifier l'authentification et les permissions pour les admin seulement
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }

  try {
    return await contactMessageController.respond(request)
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
