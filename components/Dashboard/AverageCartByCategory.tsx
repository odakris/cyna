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
import { useEffect, useState, useRef } from "react"

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
      <div className="bg-white p-2 sm:p-4 border border-gray-200 rounded-md shadow-lg text-xs sm:text-sm">
        <p className="font-medium text-gray-900 mb-1 sm:mb-2">
          {label
            ? new Date(label.toString()).toLocaleDateString("fr-FR", {
                dateStyle: "long",
              })
            : ""}
        </p>
        {sortedPayload.map((entry, index) => (
          <div
            key={`item-${index}`}
            className="flex items-center mb-0.5 sm:mb-1"
          >
            <div
              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-1 sm:mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 mr-1 sm:mr-2 text-xs sm:text-sm">
              {entry.name}:
            </span>
            <span className="font-semibold text-xs sm:text-sm">
              {formatEuro(entry.value)}
            </span>
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
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Surveiller et mettre à jour la taille du conteneur
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Si les données sont vides, afficher un message
  if (!data.length) {
    return (
      <div className="flex h-full justify-center items-center">
        <p className="text-gray-500 text-sm sm:text-base">
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
    const isMobile = containerSize.width < 500

    if (timeFrame === "5weeks") {
      // Format semaine (ex: "Semaine 12" ou "Sem 12" sur mobile)
      return isMobile ? `S${date.getWeek()}` : `Sem ${date.getWeek()}`
    } else {
      // Format jour adapté à la taille
      return isMobile
        ? `${date.getDate()}/${date.getMonth() + 1}`
        : date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    }
  }

  // Formatter les valeurs de l'axe X selon la taille d'écran
  const formatYAxis = (value: number) => {
    if (containerSize.width < 500) {
      // Version compacte pour mobile
      if (value >= 1000) return `${(value / 1000).toFixed(0)}k€`
      return `${value}€`
    }
    return formatEuro(value)
  }

  // Adapter l'affichage des légendes selon la taille
  const shouldShowLegend = containerSize.width >= 350
  const isMobile = containerSize.width < 500

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <ResponsiveContainer
        width="100%"
        height={shouldShowLegend ? "93%" : "100%"}
      >
        <BarChart
          data={transformedData}
          margin={{
            top: 10,
            right: isMobile ? 5 : 30,
            left: isMobile ? 5 : 20,
            bottom: 20,
          }}
          barGap={0}
          barCategoryGap={isMobile ? 10 : 20}
          layout="vertical"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e5e7eb"
          />
          <XAxis
            type="number"
            tickFormatter={formatYAxis}
            tick={{ fontSize: isMobile ? 9 : 12, fill: "#6b7280" }}
            stroke="#d1d5db"
          />
          <YAxis
            type="category"
            dataKey="date"
            tickFormatter={formatXAxis}
            tick={{ fontSize: isMobile ? 9 : 12, fill: "#6b7280" }}
            width={isMobile ? 60 : 120}
            stroke="#d1d5db"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            iconType="circle"
            iconSize={isMobile ? 8 : 10}
            wrapperStyle={{
              paddingBottom: isMobile ? 5 : 10,
              fontSize: isMobile ? "0.7rem" : "0.75rem",
            }}
          />
          {categories.map(category => (
            <Bar
              key={category}
              dataKey={category}
              name={category}
              fill={categoryColors[category] || "#9ca3af"}
              stackId="a"
              radius={[0, 4, 4, 0]}
              maxBarSize={isMobile ? 20 : 30}
              isAnimationActive={true}
              animationDuration={500}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Légende des catégories avec couleurs - uniquement sur petits écrans si nécessaire */}
      {shouldShowLegend && containerSize.width < 640 && (
        <div className="flex flex-wrap justify-center mt-1 gap-2 sm:gap-4">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <div
                className="w-2 sm:w-3 h-2 sm:h-3 rounded-full mr-1"
                style={{
                  backgroundColor: categoryColors[category] || "#9ca3af",
                }}
              />
              <span className="text-xs sm:text-sm">{category}</span>
            </div>
          ))}
        </div>
      )}
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
