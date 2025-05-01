import UserFormPage from "@/components/Forms/UserForm"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Créer un Utilisateur | CYNA Backoffice",
  description: "Création d'un utilisateur CYNA",
}

export default function CreateUserPage() {
  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer des utilisateurs." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <UserFormPage />
      </div>
    </RoleGuard>
  )
}
