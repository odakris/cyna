import { NextRequest, NextResponse } from "next/server"
import heroCarouselController from "@/lib/controllers/hero-carousel-controller"

export async function GET(): Promise<NextResponse> {
  try {
    return await heroCarouselController.getAll()
  } catch (error) {
    console.error("Route - Error in GET /api/hero-carousel:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    return await heroCarouselController.create(request)
  } catch (error) {
    console.error("Route - Error in POST /api/hero-carousel:", error)
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}
