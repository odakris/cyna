import EditMainMessagePage from "@/components/Admin/MainMessage/Edit/EditMainMessagePage"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { Metadata } from "next"
import { validateId } from "@/lib/utils/utils"

export const metadata: Metadata = {
  title: "Modifier un message | CYNA Backoffice",
  description: "Modifier un message principal existant sur le site CYNA",
}

export default async function EditMessagePage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid message ID")
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de modifier les messages." />
      }
    >
      <EditMainMessagePage messageId={id.toString()} />
    </RoleGuard>
  )
}
