// /app/api/sales/route.js
import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") || "7days"

  // Calculer les ventes par jour sur 7 jours ou 5 semaines
  const days = period === "7days" ? 7 : 35
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // Ventes par jour
    const dailySales = await prisma.produit_Commande.groupBy({
      by: ["id_product"],
      _sum: { id_commande: true }, // Approximation des ventes
      where: {
        commande: {
          date_commande: { gte: startDate },
        },
      },
    })

    const dailySalesData = await Promise.all(
      dailySales.map(async sale => {
        const product = await prisma.produit.findUnique({
          where: { id_product: sale.id_product },
        })
        return {
          day: new Date().toLocaleDateString("fr-FR", { weekday: "short" }), // Simplifié, à ajuster
          sales: sale._sum.id_commande * product.prix_unitaire,
        }
      })
    )

    // Ventes par catégorie
    const categorySales = await prisma.produit.groupBy({
      by: ["id_category"],
      _sum: { prix_unitaire: true },
      where: {
        produitsCommandes: {
          some: {
            commande: { date_commande: { gte: startDate } },
          },
        },
      },
    })

    const categorySalesData = await Promise.all(
      categorySales.map(async sale => {
        const category = await prisma.category.findUnique({
          where: { id_category: sale.id_category },
        })
        return {
          name: category.nom,
          value: sale._sum.prix_unitaire,
        }
      })
    )

    return NextResponse.json({ dailySalesData, categorySalesData })
  } catch (error) {
    console.error("Erreur GET sales:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
