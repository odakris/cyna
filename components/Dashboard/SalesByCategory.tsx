"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Sector,
} from "recharts"
import { CategorySalesData } from "@/types/dashboard"
import { formatEuro, formatPercentage } from "@/lib/utils/format"
import { useState, useEffect, useRef } from "react"
import {
  PieChartTooltipProps,
  PieChartEntry,
  PieChartMouseEvent,
} from "@/types/recharts"

interface SalesByCategoryProps {
  data: CategorySalesData[]
}

// Fonction pour générer dynamiquement des couleurs contrastées
const generateCategoryColors = (count: number): string[] => {
  // On utilise HSL pour garantir des couleurs contrastées sur le cercle chromatique
  const colors: string[] = []
  const saturation = 85 // Saturation élevée pour des couleurs vives
  const lightness = 60 // Luminosité moyenne pour bon contraste

  // Distribuer les couleurs uniformément autour du cercle chromatique
  for (let i = 0; i < count; i++) {
    // Calculer un angle de teinte réparti sur 360°
    const hue = Math.round((i * 360) / count)
    // Convertir HSL en RGB
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`)
  }

  // Si aucune catégorie, retourner quelques couleurs par défaut
  if (count === 0) {
    return [
      "#3b82f6", // Bleu
      "#10b981", // Vert
      "#f97316", // Orange
    ]
  }

  return colors
}

// Composant pour une portion active/survolée du graphique
// Utilisation de "any" pour éviter les problèmes de typage avec Recharts
const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-20}
        textAnchor="middle"
        fill="#374151"
        className="text-base sm:text-lg font-semibold"
        style={{ fontSize: innerRadius < 50 ? "0.875rem" : "1rem" }}
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        fill="#4b5563"
        className="text-sm sm:text-base"
        style={{ fontSize: innerRadius < 50 ? "0.75rem" : "0.875rem" }}
      >
        {formatEuro(value)}
      </text>
      <text
        x={cx}
        y={cy}
        dy={20}
        textAnchor="middle"
        fill="#6b7280"
        className="text-xs sm:text-sm"
        style={{ fontSize: innerRadius < 50 ? "0.7rem" : "0.75rem" }}
      >
        {formatPercentage(percent)}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + (innerRadius < 50 ? 4 : 8)}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + (innerRadius < 50 ? 4 : 8)}
        outerRadius={outerRadius + (innerRadius < 50 ? 6 : 12)}
        fill={fill}
      />
    </g>
  )
}

// Composant personnalisé pour l'infobulle
const CustomTooltip: React.FC<PieChartTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-2 sm:p-4 border border-gray-200 rounded-md shadow-lg text-xs sm:text-sm">
        <p className="font-medium text-gray-900 mb-1">{data.name}</p>
        <p className="text-gray-600 mb-1">
          Ventes:{" "}
          <span className="font-semibold">{formatEuro(data.value)}</span>
        </p>
        <p className="text-gray-600">
          Part:{" "}
          <span className="font-semibold">
            {formatPercentage(data.percentage / 100)}
          </span>
        </p>
      </div>
    )
  }

  return null
}

export default function SalesByCategory({ data }: SalesByCategoryProps) {
  // État pour suivre l'index de la section active
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined)
  // État pour suivre la taille du conteneur
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Déterminer la taille du conteneur
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

  // Calculer les dimensions du graphique en fonction de la taille d'écran
  const getChartDimensions = () => {
    const isMobile = containerSize.width < 500
    const isSmall = containerSize.width < 350

    return {
      innerRadius: isSmall ? 40 : isMobile ? 50 : 60,
      outerRadius: isSmall ? 60 : isMobile ? 70 : 80,
      pieHeight: containerSize.height > 400 ? "70%" : "55%",
    }
  }

  const { innerRadius, outerRadius, pieHeight } = getChartDimensions()

  // Si les données sont vides, afficher un message
  if (!data.length) {
    return (
      <div className="flex h-full justify-center items-center">
        <p className="text-gray-500 text-sm sm:text-base">
          Aucune donnée de vente par catégorie disponible
        </p>
      </div>
    )
  }

  // Calculer le total des ventes pour les pourcentages
  const totalSales = data.reduce((sum, item) => sum + item.value, 0)

  // Générer des couleurs dynamiquement en fonction du nombre de catégories
  const categoryColors = generateCategoryColors(data.length)

  // Formatter pour l'affichage
  const formattedData: PieChartEntry[] = data.map(item => ({
    ...item,
    percentage: (item.value / totalSales) * 100,
  }))

  // Gérer le survol d'une section
  const onPieEnter = (_: PieChartMouseEvent, index: number) => {
    setActiveIndex(index)
  }

  // Gérer la sortie du survol
  const onPieLeave = () => {
    setActiveIndex(undefined)
  }

  // Déterminer si l'affichage doit être simplifié pour les petits écrans
  const isCompactView = containerSize.width < 400

  return (
    <div ref={containerRef} className="flex flex-col h-full">
      <ResponsiveContainer width="100%" height={pieHeight}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
          >
            {formattedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={categoryColors[index % categoryColors.length]}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Table récapitulative adaptative */}
      <div className="mt-2 sm:mt-3 overflow-x-auto border rounded-lg shadow-sm text-xs sm:text-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ventes
              </th>
              {!isCompactView && (
                <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {formattedData.map((item, index) => (
              <tr
                key={index}
                className={`${activeIndex === index ? "bg-gray-50" : ""} hover:bg-gray-50 transition-colors`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
              >
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-3 sm:w-4 h-3 sm:h-4 rounded-full mr-1 sm:mr-2 flex-shrink-0"
                      style={{
                        backgroundColor:
                          categoryColors[index % categoryColors.length],
                      }}
                    ></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-full">
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium text-gray-900">
                  {formatEuro(item.value)}
                </td>
                {!isCompactView && (
                  <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium text-gray-900">
                    {formatPercentage(item.percentage / 100)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                Total
              </td>
              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium text-gray-900">
                {formatEuro(totalSales)}
              </td>
              {!isCompactView && (
                <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium text-gray-900">
                  100%
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
