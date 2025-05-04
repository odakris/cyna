import { NextResponse } from "next/server"
import contactMessageController from "@/lib/controllers/contact-message-controller"
import { checkPermission } from "@/lib/api-permissions"

export async function GET() {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("contact:view")
    if (permissionCheck) return permissionCheck

    return await contactMessageController.getStats()
  } catch (error) {
    console.error("API Route Error:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
