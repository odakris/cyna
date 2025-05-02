import Link from "next/link"
import { Button } from "@/components/ui/button"

interface UserFormErrorProps {
  errorMessage: string | null
  isEditing: boolean
}

export default function UserFormError({
  errorMessage,
  isEditing,
}: UserFormErrorProps) {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">
        {isEditing ? "Modifier l'utilisateur" : "Créer un Nouvel Utilisateur"}
      </h1>
      <p className="text-red-500">
        {errorMessage || "Utilisateur introuvable"}
      </p>
      <Button asChild variant="outline">
        <Link href="/dashboard/users">Retour</Link>
      </Button>
    </div>
  )
}
