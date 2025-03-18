"use client"

import AdminLayout from "@/components/AdminLayout/AdminLayout"
import { useSession } from "next-auth/react"
// import { useState, useEffect } from "react"
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts"

// Définir les types pour les données de ventes
// interface DailySalesData {
//   day: string
//   sales: number
// }

// interface CategorySalesData {
//   name: string
//   value: number
// }

// Couleurs pour les graphiques
// const COLORS: string[] = ["#0088FE", "#00C49F", "#FFBB28"]

export default function DashboardContent() {
  const { data: session } = useSession()
  // const [period, setPeriod] = useState<string>("7days")
  // const [dailySalesData, setDailySalesData] = useState<DailySalesData[]>([])
  // const [categorySalesData, setCategorySalesData] = useState<
  //   CategorySalesData[]
  // >([])

  // const fetchSalesData = async () => {
  //   try {
  //     const response = await fetch(`/api/sales?period=${period}`)
  //     if (!response.ok)
  //       throw new Error("Erreur lors de la récupération des ventes")
  //     const {
  //       dailySalesData,
  //       categorySalesData,
  //     }: {
  //       dailySalesData: DailySalesData[]
  //       categorySalesData: CategorySalesData[]
  //     } = await response.json()
  //     console.log("Données récupérées:", { dailySalesData, categorySalesData })
  //     setDailySalesData(dailySalesData)
  //     setCategorySalesData(categorySalesData)
  //   } catch (error) {
  //     console.error("Erreur fetchSalesData:", error)
  //   }
  // }

  // useEffect(() => {
  //   fetchSalesData()
  // }, [period])

  // console.log("DashboardContent - Rendu avec session:", session)

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Tableau de bord</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle :{" "}
        {session?.user?.role}
      </p>

      {/* Sélecteur de période */}
      {/* <div className="mb-6">
        <label className="mr-2">Période :</label>
        <select
          value={period}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPeriod(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="7days">7 derniers jours</option>
          <option value="5weeks">5 dernières semaines</option>
        </select>
      </div> */}

      {/* Histogramme des ventes par jour */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Ventes par jour</h2>
        <BarChart width={600} height={300} data={dailySalesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="sales" fill="#8884d8" />
        </BarChart>
      </div> */}

      {/* Histogramme multi-couches des paniers moyens */}
      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Paniers moyens par catégorie
        </h2>
        <BarChart width={600} height={300} data={dailySalesData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          {categorySalesData.map((cat, index) => (
            <Bar
              key={cat.name}
              dataKey="sales"
              stackId="a"
              fill={COLORS[index % COLORS.length]}
              name={cat.name}
            />
          ))}
        </BarChart>
      </div> */}

      {/* Graphique camembert des ventes par catégorie */}
      {/* <div>
        <h2 className="text-xl font-semibold mb-2">
          Répartition des ventes par catégorie
        </h2>
        <PieChart width={400} height={400}>
          <Pie
            data={categorySalesData}
            cx={200}
            cy={200}
            labelLine={false}
            label={({ name, percent }: { name: string; percent: number }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {categorySalesData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div> */}
    </AdminLayout>
  )
}
