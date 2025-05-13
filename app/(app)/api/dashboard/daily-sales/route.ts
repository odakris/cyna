import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { TimeFrame } from "@/types/dashboard"
import { checkPermission } from "@/lib/api-permissions"

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier les permissions
    const permissionCheck = await checkPermission("dashboard:view")
    if (permissionCheck) return permissionCheck

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

    // Si c'est 5 semaines, grouper par semaine
    const isWeeklyGrouping = timeFrame === "5weeks"

    // Formatage de la date pour SQL
    const startDateString = startDate.toISOString().split("T")[0]

    // Obtenir toutes les commandes dans la période
    const orders = await prisma.order.findMany({
      where: {
        order_date: {
          gte: new Date(startDateString),
        },
        order_status: {
          in: ["ACTIVE", "COMPLETED", "PROCESSING"],
        },
      },
      select: {
        order_date: true,
        total_amount: true,
      },
      orderBy: {
        order_date: "asc",
      },
    })

    // Grouper les ventes par jour ou par semaine
    interface SalesByDate {
      [key: string]: number
    }

    interface Order {
      order_date: Date
      total_amount: number
    }

    const salesByDate: SalesByDate = orders.reduce(
      (acc: SalesByDate, order: Order) => {
        let dateKey: string

        if (isWeeklyGrouping) {
          // Obtenir le premier jour de la semaine pour regrouper par semaine
          const orderDate = new Date(order.order_date)
          const dayOfWeek = orderDate.getDay() // 0 = dimanche, 1 = lundi, ...
          const diff =
            orderDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Ajuster pour commencer la semaine le lundi
          const startOfWeek = new Date(orderDate.setDate(diff))
          dateKey = startOfWeek.toISOString().split("T")[0]
        } else {
          // Grouper par jour
          dateKey = new Date(order.order_date).toISOString().split("T")[0]
        }

        if (!acc[dateKey]) {
          acc[dateKey] = 0
        }

        acc[dateKey] += order.total_amount
        return acc
      },
      {} as SalesByDate
    )

    // Convertir en format de tableau pour le graphique
    const dailySales = Object.entries(salesByDate).map(([date, value]) => ({
      date,
      value,
    }))

    // Retourner les données
    return NextResponse.json({
      success: true,
      dailySales,
    })
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération des ventes quotidiennes:",
      error
    )*/
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des ventes quotidiennes",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}
