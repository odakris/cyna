import { NextRequest, NextResponse } from "next/server"
import orderController from "@/lib/controllers/order-controller"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const orderIdParam = url.pathname.split("/").pop()
    const orderId = parseInt(orderIdParam || "", 10)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "ID de commande invalide" },
        { status: 400 }
      )
    }

    // Utilisez le contrôleur au lieu d'appeler directement Prisma
    return await orderController.getById(orderId)
  } catch (error: any) {
    /*console.error("[OrderRoute] Erreur:", {
      message: error.message,
      stack: error.stack,
    })*/
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération de la commande",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId, 10)

    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: "ID de commande invalide" },
        { status: 400 }
      )
    }

    // Ajout de logs pour le débogage
    console.log(`[API] Tentative de suppression de la commande ${orderId}`)

    return await orderController.remove(orderId)
  } catch (error: any) {
    // console.error("[OrderRoute] Erreur:", error)
    return NextResponse.json(
      {
        error: "Erreur lors de la suppression de la commande",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = parseInt(params.orderId || "", 10)

    if (isNaN(orderId)) {
      // console.error("[OrderRoute] ID de commande invalide:", params.orderId)
      return NextResponse.json(
        { error: "ID de commande invalide" },
        { status: 400 }
      )
    }

    // Appeler le controller pour mettre à jour le statut
    return await orderController.updateStatus(request, orderId)
  } catch (error: any) {
    /*console.error("[OrderRoute] Erreur lors de la mise à jour:", {
      message: error.message,
      stack: error.stack,
    })*/
    return NextResponse.json(
      {
        error: "Erreur lors de la mise à jour de la commande",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
