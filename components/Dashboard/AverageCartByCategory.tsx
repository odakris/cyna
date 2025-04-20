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
import { TooltipProps, ChartEntry } from "@/types/recharts"

interface AverageCartByCategoryProps {
  data: ChartData[]
  timeFrame: TimeFrame
}

// Fonction pour générer des couleurs contrastées selon les catégories
const generateCategoryColors = (
  categories: string[]
): Record<string, string> => {
  const colorMap: Record<string, string> = {}

  // Distribuer les couleurs uniformément autour du cercle chromatique
  categories.forEach((category, index) => {
    // Calculer un angle de teinte réparti sur 360°
    const hue = Math.round((index * 360) / categories.length)
    // Convertir HSL en CSS
    colorMap[category] = `hsl(${hue}, 85%, 60%)`
  })

  // Par défaut, si aucune catégorie n'est fournie
  if (categories.length === 0) {
    return {
      Prévention: "#3b82f6", // Bleu vif
      Protection: "#10b981", // Vert émeraude
      Réponse: "#f97316", // Orange vif
    }
  }

  return colorMap
}

// Style personnalisé pour l'infobulle
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Trier les entrées par valeur décroissante pour une meilleure lisibilité
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value)

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
        <p className="font-medium text-gray-900 mb-2">
          {label
            ? new Date(label.toString()).toLocaleDateString("fr-FR", {
                dateStyle: "long",
              })
            : ""}
        </p>
        {sortedPayload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center mb-1">
            <div
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 mr-2">{entry.name}:</span>
            <span className="font-semibold">{formatEuro(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return null
}

export default function AverageCartByCategory({
  data,
  timeFrame,
}: AverageCartByCategoryProps) {
  // Si les données sont vides, afficher un message
  if (!data.length) {
    return (
      <div className="flex h-full justify-center items-center">
        <p className="text-gray-500">
          Aucune donnée de panier moyen disponible pour cette période
        </p>
      </div>
    )
  }

  // Extraire les noms de catégories uniques du jeu de données
  const categories = [
    ...new Set(data.map(item => item.category).filter(Boolean) as string[]),
  ]

  // Générer dynamiquement les couleurs pour les catégories
  const categoryColors = generateCategoryColors(categories)

  // Transformer les données pour le graphique multi-couches
  // Nous devons regrouper par date et avoir une clé pour chaque catégorie
  const transformedData: ChartEntry[] = data.reduce(
    (acc: ChartEntry[], curr) => {
      if (!curr.category) return acc // Ignorer les entrées sans catégorie

      const date = curr.date
      const existingEntry = acc.find(item => item.date === date)

      if (existingEntry) {
        existingEntry[curr.category] = curr.value
      } else {
        const newEntry: ChartEntry = { date }
        newEntry[curr.category] = curr.value
        acc.push(newEntry)
      }

      return acc
    },
    []
  )

  // Formatter les dates pour l'axe Y selon la période
  const formatXAxis = (value: string): string => {
    const date = new Date(value)
    if (timeFrame === "5weeks") {
      // Format semaine (ex: "Semaine 12")
      return `Semaine ${date.getWeek()}`
    } else {
      // Format jour (ex: "12 avril")
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={transformedData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 30,
          }}
          barGap={0}
          barCategoryGap={20}
          layout="vertical"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e5e7eb"
          />
          <XAxis
            type="number"
            tickFormatter={value => formatEuro(value as number)}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            stroke="#d1d5db"
          />
          <YAxis
            type="category"
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: "#6b7280" }}
            width={120}
            stroke="#d1d5db"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ paddingBottom: 10 }}
          />
          {categories.map(category => (
            <Bar
              key={category}
              dataKey={category}
              name={category}
              fill={categoryColors[category] || "#9ca3af"}
              stackId="a"
              radius={[0, 4, 4, 0]}
              maxBarSize={30}
              isAnimationActive={true}
              animationDuration={500}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Légende des catégories avec couleurs */}
      <div className="flex justify-center mt-2 gap-6">
        {categories.map(category => (
          <div key={category} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: categoryColors[category] || "#9ca3af" }}
            />
            <span className="text-sm font-medium">{category}</span>
          </div>
        ))}
      </div>
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
