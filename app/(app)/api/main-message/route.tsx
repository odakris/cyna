import { NextRequest, NextResponse } from "next/server"
import mainMessageController from "@/lib/controllers/main-message-controller"

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
    return await mainMessageController.create(request)
  } catch (error) {
    console.error("Route - Error in POST /api/main-message:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}
