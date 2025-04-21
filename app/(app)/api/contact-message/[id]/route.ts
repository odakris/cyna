// app/api/contact-message/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import contactMessageController from "@/lib/controllers/contact-message-controller"
import { validateId } from "@/lib/utils/utils"
import { checkPermission } from "@/lib/api-permissions"

// app/api/contact-message/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("contact:view")
    if (permissionCheck) return permissionCheck

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
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("contact:delete")
    if (permissionCheck) return permissionCheck

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
