import { NextResponse } from "next/server"
import mainMessageController from "@/lib/controllers/main-message-controller"

export async function GET(): Promise<NextResponse> {
  try {
    return await mainMessageController.getActive()
  } catch (error) {
    // console.error("Route - Error in GET /api/main-message/active:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}
