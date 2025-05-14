import NewMainMessagePage from "@/components/Admin/MainMessage/Create/NewMainMessagePage"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Créer un nouveau message | CYNA Backoffice",
  description: "Créer un nouveau message principal pour le site CYNA",
}

export default function NewMessagePage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer un message." />
      }
    >
      <NewMainMessagePage />
    </RoleGuard>
  )
}
