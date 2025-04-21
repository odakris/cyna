// app/api/contact-message/respond/route.ts
import { NextRequest, NextResponse } from "next/server"
import contactMessageController from "@/lib/controllers/contact-message-controller"
import { checkPermission } from "@/lib/api-permissions"

export async function POST(request: NextRequest) {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("contact:respond")
    if (permissionCheck) return permissionCheck

    return await contactMessageController.respond(request)
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
