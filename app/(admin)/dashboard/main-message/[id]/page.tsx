import { Metadata } from "next"
import { validateId } from "@/lib/utils/utils"
import MainMessageDetail from "@/components/Admin/MainMessage/Detail/MainMessageDetail"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"

export const metadata: Metadata = {
  title: "Détails du Message Principal | CYNA Backoffice",
  description: "Détails et gestion d'un message principal spécifique",
}

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)

  if (id === null) {
    throw new Error("ID du message invalide")
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <MainMessageDetail id={id.toString()} />
    </RoleGuard>
  )
}
