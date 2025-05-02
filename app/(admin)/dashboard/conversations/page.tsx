import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import ConversationPage from "@/components/Admin/Conversations/ConversationPage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conversations Chatbot | CYNA Backoffice",
  description: "Gérez les conversations de votre chatbot.",
}

export default function ConversationsHomePage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de voir les conversations." />
      }
    >
      <ConversationPage />
    </RoleGuard>
  )
}
