import { PrismaClient } from "@prisma/client"
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  context: { params: { email: string } }
) {
  // Attendre que les params soient résolus avant d'y accéder
  const { email } = await context.params || {}

  // Vérifier si l'email est présent
  if (!email) {
    return NextResponse.json(
      { error: "Email manquant dans l'URL." },
      { status: 400 }
    )
  }

  try {
    // Récupérer les commandes associées à l'utilisateur par email
    const orders = await prisma.order.findMany({
      where: { user: { email } },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Vérification de l'absence de commandes
    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Aucune commande trouvée." },
        { status: 404 }
      )
    }

    // Retourner les commandes
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes." },
      { status: 500 }
    )
  }
}
