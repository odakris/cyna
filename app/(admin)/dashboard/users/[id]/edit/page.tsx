import UserForm from "@/components/Forms/UserForm"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { validateId } from "@/lib/utils/utils"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Modifier l'Utilisateur | CYNA Backoffice",
  description: "Édition des informations d'un utilisateur CYNA",
}

export default async function EditUserPage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid user ID")
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de modifier les utilisateurs." />
      }
    >
      <div className="mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
        <UserForm userId={id.toString()} />
      </div>
    </RoleGuard>
  )
}
