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

interface DailySalesChartProps {
  data: ChartData[]
  timeFrame: TimeFrame
}

export default function DailySalesChart({
  data,
  timeFrame,
}: DailySalesChartProps) {
  // Si les données sont vides, afficher un message
  if (!data.length) {
    return (
      <div className="flex h-full justify-center items-center">
        <p className="text-gray-500">
          Aucune donnée de vente disponible pour cette période
        </p>
      </div>
    )
  }

  // Formatter les dates pour l'axe X selon la période
  const formatXAxis = (value: string) => {
    const date = new Date(value)
    if (timeFrame === "5weeks") {
      // Format semaine (ex: "Sem 12")
      return `Sem ${date.getWeek()}`
    } else {
      // Format jour (ex: "12/04")
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={50}
        />
        <YAxis
          tickFormatter={value => formatEuro(value)}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={value => [formatEuro(value as number), "Ventes"]}
          labelFormatter={label => {
            const date = new Date(label)
            return `${date.toLocaleDateString("fr-FR")}`
          }}
        />
        <Legend />
        <Bar
          dataKey="value"
          name="Total des ventes"
          fill="#4f46e5"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
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
