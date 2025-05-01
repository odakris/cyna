import { Metadata } from "next"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import CategoryPage from "@/components/Admin/Categories/CategoryPage"

export const metadata: Metadata = {
  title: "Gestion des Catégories | CYNA Backoffice",
  description: "Interface de gestion des catégories CYNA",
}

export default function CategoryHomePage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de gérer les catégories." />
      }
    >
      <CategoryPage />
    </RoleGuard>
  )
}
