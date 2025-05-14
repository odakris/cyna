import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import ConversationDetailPage from "@/components/Admin/Conversations/Detail/ConversationDetailPage"
import { Metadata } from "next"
import { validateId } from "@/lib/utils/utils"

export const metadata: Metadata = {
  title: "Détails de la Conversation | CYNA Backoffice",
  description: "Détails de la conversation",
}

export default async function ConversationDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid order ID")
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de voir les conversations." />
      }
    >
      <ConversationDetailPage conversationId={id.toString()} />
    </RoleGuard>
  )
}
