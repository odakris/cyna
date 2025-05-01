import { Metadata } from "next"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import ContactMessagePage from "@/components/Admin/ContactMessages/ContactMessagePage"

export const metadata: Metadata = {
  title: "Gestion des Messages | CYNA Backoffice",
  description: "Interface de gestion des messages de contact CYNA",
}

export default function ContactMessagesHomePage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission d'accéder à cette page." />
      }
    >
      <ContactMessagePage />
    </RoleGuard>
  )
}
