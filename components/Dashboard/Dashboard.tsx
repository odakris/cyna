"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import DailySalesChart from "./DailySalesChart"
import AverageCartByCategory from "./AverageCartByCategory"
import SalesByCategory from "./SalesByCategory"
import {
  DailySalesChartSkeleton,
  PieChartSkeleton,
  AverageCartSkeleton,
} from "../Skeletons/DashboardSkeletons"
import {
  fetchDailySales,
  fetchCategorySales,
  fetchAverageCartByCategory,
} from "@/lib/api/dashboard-api"
import { ChartData, CategorySalesData, TimeFrame } from "@/types/dashboard"

export default function Dashboard() {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("week")
  const [isLoading, setIsLoading] = useState(true)
  const [dailySales, setDailySales] = useState<ChartData[]>([])
  const [categorySales, setCategorySales] = useState<CategorySalesData[]>([])
  const [averageCart, setAverageCart] = useState<ChartData[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        // Récupérer les données de ventes quotidiennes
        const salesData = await fetchDailySales(timeFrame)
        setDailySales(salesData)

        // Récupérer les données de ventes par catégorie
        const catSalesData = await fetchCategorySales(timeFrame)
        setCategorySales(catSalesData)

        // Récupérer les données de panier moyen par catégorie
        const cartData = await fetchAverageCartByCategory(timeFrame)
        setAverageCart(cartData)
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des données du tableau de bord:",
          error
        )
        toast({
          title: "Erreur de chargement",
          description:
            "Impossible de charger les données du tableau de bord. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [timeFrame, toast])

  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as TimeFrame)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Tableau de Bord des Ventes
        </h1>
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">Période :</span>
          {isLoading ? (
            <Skeleton className="h-10 w-[180px]" />
          ) : (
            <Select value={timeFrame} onValueChange={handleTimeFrameChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">30 derniers jours</SelectItem>
                <SelectItem value="5weeks">5 dernières semaines</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Histogramme des ventes par jour */}
        <Card className="shadow-md">
          <CardHeader>
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-60 mb-2" />
                <Skeleton className="h-4 w-80" />
              </>
            ) : (
              <>
                <CardTitle>Évolution des Ventes</CardTitle>
                <CardDescription>
                  Total des ventes par jour{" "}
                  {timeFrame === "week"
                    ? "sur les 7 derniers jours"
                    : timeFrame === "month"
                      ? "sur les 30 derniers jours"
                      : "sur les 5 dernières semaines"}
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <DailySalesChartSkeleton />
            ) : (
              <DailySalesChart data={dailySales} timeFrame={timeFrame} />
            )}
          </CardContent>
        </Card>

        {/* Graphique camembert des ventes par catégorie */}
        <Card className="shadow-md">
          <CardHeader>
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <CardTitle>Répartition des Ventes</CardTitle>
                <CardDescription>
                  Distribution des ventes par catégorie de produits
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <PieChartSkeleton />
            ) : (
              <SalesByCategory data={categorySales} />
            )}
          </CardContent>
        </Card>

        {/* Histogramme multi-couches des paniers moyens */}
        <Card className="shadow-md">
          <CardHeader>
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-72 mb-2" />
                <Skeleton className="h-4 w-80" />
              </>
            ) : (
              <>
                <CardTitle>Paniers Moyens par Catégorie</CardTitle>
                <CardDescription>
                  Répartition des paniers moyens par catégorie de produits
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoading ? (
              <AverageCartSkeleton />
            ) : (
              <AverageCartByCategory data={averageCart} timeFrame={timeFrame} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
