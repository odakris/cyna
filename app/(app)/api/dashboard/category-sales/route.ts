import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { TimeFrame } from "@/types/dashboard"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Récupérer le paramètre timeFrame de la requête
    const searchParams = request.nextUrl.searchParams
    const timeFrame = (searchParams.get("timeFrame") || "week") as TimeFrame

    // Déterminer la date de début en fonction de timeFrame
    const startDate = new Date()

    if (timeFrame === "week") {
      // 7 derniers jours
      startDate.setDate(startDate.getDate() - 7)
    } else if (timeFrame === "month") {
      // 30 derniers jours
      startDate.setDate(startDate.getDate() - 30)
    } else if (timeFrame === "5weeks") {
      // 5 dernières semaines
      startDate.setDate(startDate.getDate() - 35)
    }

    // Formatage de la date pour SQL
    const startDateString = startDate.toISOString().split("T")[0]

    // Obtenir toutes les commandes dans la période avec les détails des produits et catégories
    const orders = await prisma.order.findMany({
      where: {
        order_date: {
          gte: new Date(startDateString),
        },
        order_status: {
          in: ["ACTIVE", "COMPLETED", "PROCESSING"],
        },
      },
      include: {
        order_items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    })

    // Calculer les ventes par catégorie
    const salesByCategory: Record<string, number> = {}

    // Parcourir toutes les commandes et leurs articles
    orders.forEach(order => {
      order.order_items.forEach(item => {
        const categoryName = item.product.category.name
        const itemTotal = item.unit_price * item.quantity

        if (!salesByCategory[categoryName]) {
          salesByCategory[categoryName] = 0
        }

        salesByCategory[categoryName] += itemTotal
      })
    })

    // Convertir les données pour le graphique
    const categorySales = Object.entries(salesByCategory).map(
      ([name, value]) => ({
        name,
        value,
      })
    )

    // Trier par valeur décroissante
    categorySales.sort((a, b) => b.value - a.value)

    return NextResponse.json({
      success: true,
      categorySales,
    })
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des ventes par catégorie:",
      error
    )
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des ventes par catégorie",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}
