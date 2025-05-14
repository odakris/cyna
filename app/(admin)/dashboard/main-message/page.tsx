import { Metadata } from "next"
import MainMessageDashboard from "@/components/Admin/MainMessage/MainMessageDashboardPage"
import { Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"

export const metadata: Metadata = {
  title: "Gestion des Messages Principaux | CYNA Backoffice",
  description: "Interface de gestion des messages principaux du site CYNA",
}

export default function MainMessageHome() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <MainMessageDashboard />
    </RoleGuard>
  )
}
