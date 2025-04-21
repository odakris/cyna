// app/api/contact-message/route.ts
import { NextRequest, NextResponse } from "next/server"
import contactMessageController from "@/lib/controllers/contact-message-controller"
import { checkPermission } from "@/lib/api-permissions"

export async function GET(request: NextRequest) {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("contact:view")
    if (permissionCheck) return permissionCheck

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
    // Vérifier les permissions
    const permissionCheck = await checkPermission("contact:respond")
    if (permissionCheck) return permissionCheck

    return await contactMessageController.create(request)
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
