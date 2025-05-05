"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { ChartData, TimeFrame } from "@/types/dashboard"
import { formatEuro } from "@/lib/utils/format"
import { useEffect, useState, useRef } from "react"

interface DailySalesChartProps {
  data: ChartData[]
  timeFrame: TimeFrame
}

export default function DailySalesChart({
  data,
  timeFrame,
}: DailySalesChartProps) {
  const [chartWidth, setChartWidth] = useState<number>(0)
  const chartRef = useRef<HTMLDivElement>(null)

  // Adapter l'affichage du graphique en fonction de la largeur
  useEffect(() => {
    const updateDimensions = () => {
      if (chartRef.current) {
        setChartWidth(chartRef.current.offsetWidth)
      }
    }

    // Initialiser et écouter les changements de taille
    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Si les données sont vides, afficher un message
  if (!data.length) {
    return (
      <div className="flex h-full justify-center items-center">
        <p className="text-gray-500 text-sm sm:text-base">
          Aucune donnée de vente disponible pour cette période
        </p>
      </div>
    )
  }

  // Formatter les dates pour l'axe X selon la période et la taille d'écran
  const formatXAxis = (value: string) => {
    const date = new Date(value)
    const isMobile = chartWidth < 500

    if (timeFrame === "5weeks") {
      // Format semaine adapté à la taille
      return isMobile ? `S${date.getWeek()}` : `Sem ${date.getWeek()}`
    } else {
      // Format jour adapté à la taille
      return isMobile
        ? `${date.getDate()}/${date.getMonth() + 1}`
        : `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`
    }
  }

  // Formatter les valeurs de l'axe Y selon la taille d'écran
  const formatYAxis = (value: number) => {
    const isMobile = chartWidth < 500
    if (isMobile) {
      // Version compacte pour mobile
      if (value >= 1000) return `${(value / 1000).toFixed(0)}k€`
      return `${value}€`
    }
    return formatEuro(value)
  }

  return (
    <div ref={chartRef} className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: chartWidth < 500 ? 10 : 30,
            left: chartWidth < 500 ? 10 : 20,
            bottom: chartWidth < 500 ? 40 : 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{
              fontSize: chartWidth < 500 ? 9 : 12,
            }}
            angle={-45}
            textAnchor="end"
            height={chartWidth < 500 ? 35 : 50}
            interval={chartWidth < 400 ? 1 : 0}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{
              fontSize: chartWidth < 500 ? 9 : 12,
            }}
            width={chartWidth < 500 ? 35 : 45}
          />
          <Tooltip
            formatter={value => [formatEuro(value as number), "Ventes"]}
            labelFormatter={label => {
              const date = new Date(label)
              return `${date.toLocaleDateString("fr-FR")}`
            }}
            contentStyle={{
              fontSize: chartWidth < 500 ? "0.75rem" : "0.875rem",
              padding: chartWidth < 500 ? "4px 8px" : "8px 10px",
            }}
          />
          <Legend
            wrapperStyle={{
              fontSize: chartWidth < 500 ? "0.75rem" : "0.875rem",
              marginTop: chartWidth < 500 ? 5 : 10,
            }}
          />
          <Bar
            dataKey="value"
            name="Total des ventes"
            fill="#4f46e5"
            radius={[4, 4, 0, 0]}
            maxBarSize={chartWidth < 500 ? 20 : 40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Extension pour obtenir le numéro de semaine
declare global {
  interface Date {
    getWeek(): number
  }
}

Date.prototype.getWeek = function () {
  const date = new Date(this.getTime())
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
  const week1 = new Date(date.getFullYear(), 0, 4)
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  )
}
