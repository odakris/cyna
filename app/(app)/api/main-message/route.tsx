import { NextRequest, NextResponse } from "next/server"
import mainMessageController from "@/lib/controllers/main-message-controller"
import { checkPermission } from "@/lib/api-permissions"

export async function GET(): Promise<NextResponse> {
  try {
    return await mainMessageController.getAll()
  } catch (error) {
    console.error("Route - Error in GET /api/main-message:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("main-message:create")
    if (permissionCheck) return permissionCheck

    return await mainMessageController.create(request)
  } catch (error) {
    console.error("Route - Error in POST /api/main-message:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}
