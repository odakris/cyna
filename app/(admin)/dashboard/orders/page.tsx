import { Metadata } from "next"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import OrdersPage from "@/components/Admin/Orders/OrdersPage"

export const metadata: Metadata = {
  title: "Gestion des Commandes | CYNA Backoffice",
  description: "Interface de gestion des commandes CYNA",
}

export default function OrdersHomePage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <OrdersPage />
    </RoleGuard>
  )
}
