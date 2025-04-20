import { Metadata } from "next"
import Dashboard from "@/components/Dashboard/Dashboard"

export const metadata: Metadata = {
  title: "Tableau de Bord | CYNA Backoffice",
  description: "Suivi des ventes et performances des produits SaaS CYNA",
}

export default function DashboardPage() {
  return (
    <div className="py-6">
      <h1 className="sr-only">Tableau de Bord CYNA</h1>
      <Dashboard />
    </div>
  )
}
