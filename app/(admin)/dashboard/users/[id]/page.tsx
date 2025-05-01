import { Metadata } from "next"
import { validateId } from "@/lib/utils/utils"
import UserDetailsPage from "@/components/Admin/Users/Details/UserDetailsPage"

export const metadata: Metadata = {
  title: "Détails Utilisateur | CYNA Backoffice",
  description: "Détails et gestion d'un utilisateur CYNA spécifique",
}

export default async function UserPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid product ID")
  }
  return <UserDetailsPage params={{ id: id.toString() }} />
}
