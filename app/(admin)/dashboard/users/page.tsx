import { Metadata } from "next"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import UsersPage from "@/components/Admin/Users/UsersPage"

export const metadata: Metadata = {
  title: "Gestion des utilisateurs | CYNA Backoffice",
  description: "Interface de gestion des utilisateurs CYNA",
}

export default function UsersHomePage() {
  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <UsersPage />
    </RoleGuard>
  )
}
