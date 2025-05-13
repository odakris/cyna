import { NextRequest, NextResponse } from "next/server"
import heroCarouselService from "@/lib/services/hero-carousel-service"
import { heroCarouselSchema } from "@/lib/validations/hero-carousel-schema"
import { ZodError } from "zod"

export const getAll = async (): Promise<NextResponse> => {
  try {
    const slides = await heroCarouselService.getAllSlides()
    return NextResponse.json(slides)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const getById = async (id: number): Promise<NextResponse> => {
  try {
    const slide = await heroCarouselService.getSlideById(id)

    if (!slide) {
      return NextResponse.json({ error: "Slide non trouvé" }, { status: 404 })
    }

    return NextResponse.json(slide)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const create = async (request: NextRequest): Promise<NextResponse> => {
  try {
    const body = await request.json()
    const data = heroCarouselSchema.parse(body)
    const createdSlide = await heroCarouselService.createSlide(data)

    return NextResponse.json(createdSlide, { status: 201 })
  } catch (error) {
    // console.error("Controller - Error creating slide:", error)
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const update = async (
  id: number,
  request: NextRequest
): Promise<NextResponse> => {
  try {
    const slide = await heroCarouselService.getSlideById(id)

    if (!slide) {
      return NextResponse.json({ error: "Slide non trouvé" }, { status: 404 })
    }

    const body = await request.json()
    const data = heroCarouselSchema.parse(body)
    console.log("Data to update CONTROLLER (PUT):", data)
    const updatedSlide = await heroCarouselService.updateSlide(id, data)
    return NextResponse.json(updatedSlide, { status: 200 })
  } catch (error) {
    // console.error(`Controller - Error updating slide ${id}:`, error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// Ajout de la méthode pour les mises à jour partielles (PATCH)
export const updatePartial = async (
  id: number,
  request: NextRequest
): Promise<NextResponse> => {
  try {
    const slide = await heroCarouselService.getSlideById(id)

    if (!slide) {
      return NextResponse.json({ error: "Slide non trouvé" }, { status: 404 })
    }

    // Récupérer les données de la requête
    let body
    try {
      body = await request.json()
    } catch (error) {
      // console.error("Controller - Error parsing JSON:", error)
      return NextResponse.json(
        { error: "Corps de requête JSON invalide" },
        { status: 400 }
      )
    }

    // Utiliser partial() pour valider seulement les champs fournis
    const partialData = heroCarouselSchema.partial().parse(body)

    console.log("Data to update CONTROLLER (PATCH):", partialData)

    // Pour PATCH, nous incluons seulement les champs fournis dans la requête
    const updatedSlide = await heroCarouselService.updatePartialSlide(
      id,
      partialData
    )

    return NextResponse.json(updatedSlide, { status: 200 })
  } catch (error) {
    console.error(`Controller - Error patching slide ${id}:`, error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      )
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export const remove = async (id: number): Promise<NextResponse> => {
  try {
    const deletedSlide = await heroCarouselService.deleteSlide(id)
    return NextResponse.json(deletedSlide)
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

const heroCarouselController = {
  getAll,
  getById,
  create,
  update,
  updatePartial,
  remove,
}

export default heroCarouselController
