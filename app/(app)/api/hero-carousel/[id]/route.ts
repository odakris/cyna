import { NextRequest, NextResponse } from "next/server"
import heroCarouselController from "@/lib/controllers/hero-carousel-controller"
import { validateId } from "@/lib/utils/utils"
import { checkPermission } from "@/lib/api-permissions"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await heroCarouselController.getById(id)
  } catch (error) {
    /* console.error(
      `Route - Error in GET /api/hero-carousel/${(await params).id}:`,
      error
    ) */
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("hero-carousel:edit")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await heroCarouselController.update(id, request)
  } catch (error) {
    /*console.error(
      `Route - Error in PUT /api/hero-carousel/${(await params).id}:`,
      error
    ) */
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}

// Ajout de la méthode PATCH pour les mises à jour partielles
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("hero-carousel:edit")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    // Pour les mises à jour partielles, on utilise le même contrôleur que pour PUT
    return await heroCarouselController.updatePartial(id, request)
  } catch (error) {
    /*console.error(
      `Route - Error in PATCH /api/hero-carousel/${(await params).id}:`,
      error
    )*/
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("hero-carousel:delete")
    if (permissionCheck) return permissionCheck

    const resolvedParams = await params
    const id = validateId(resolvedParams.id)

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide ou manquant" },
        { status: 400 }
      )
    }

    return await heroCarouselController.remove(id)
  } catch (error) {
    /*console.error(
      `Route - Error in DELETE /api/hero-carousel/${(await params).id}:`,
      error
    )*/
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de la requête" },
      { status: 500 }
    )
  }
}
