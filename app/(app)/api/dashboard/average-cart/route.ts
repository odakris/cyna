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

    // Stocker les données par jour/semaine et par catégorie
    const salesData: {
      [dateKey: string]: {
        [category: string]: {
          totalAmount: number
          orderCount: number
        }
      }
    } = {}

    // Parcourir toutes les commandes
    orders.forEach((order: (typeof orders)[number]) => {
      let dateKey

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

      // Initialiser l'entrée pour cette date si elle n'existe pas
      if (!salesData[dateKey]) {
        salesData[dateKey] = {}
      }

      // Regrouper les totaux par catégorie
      const categorySales: Record<string, number> = {}

      order.order_items.forEach(
        (item: (typeof orders)[number]["order_items"][number]) => {
          const categoryName = item.product.category.name
          const itemTotal = item.unit_price * item.quantity

          if (!categorySales[categoryName]) {
            categorySales[categoryName] = 0
          }

          categorySales[categoryName] += itemTotal
        }
      )

      // Ajouter les données pour chaque catégorie
      Object.entries(categorySales).forEach(([category, amount]) => {
        if (!salesData[dateKey][category]) {
          salesData[dateKey][category] = {
            totalAmount: 0,
            orderCount: 0,
          }
        }

        salesData[dateKey][category].totalAmount += amount
        salesData[dateKey][category].orderCount += 1
      })
    })

    // Calculer les paniers moyens par jour/semaine et par catégorie
    const averageCartByCategory: {
      date: string
      category: string
      value: number
    }[] = []

    Object.entries(salesData).forEach(([date, categories]) => {
      Object.entries(categories).forEach(([category, data]) => {
        const averageCart = data.totalAmount / data.orderCount
        averageCartByCategory.push({
          date,
          category,
          value: averageCart,
        })
      })
    })

    // Trier par date
    averageCartByCategory.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    return NextResponse.json({
      success: true,
      averageCartByCategory,
    })
  } catch (error) {
    /*console.error(
      "Erreur lors de la récupération des paniers moyens par catégorie:",
      error
    )*/
    return NextResponse.json(
      {
        success: false,
        error:
          "Erreur lors de la récupération des paniers moyens par catégorie",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    )
  }
}
