import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface UserFormHeaderProps {
  isEditing: boolean
  userName?: string
}

export default function UserFormHeader({
  isEditing,
  userName,
}: UserFormHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="icon" className="rounded-full">
        <Link href="/dashboard/users">
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </Button>
      <h1 className="text-3xl font-bold">
        {isEditing
          ? `Modifier ${userName || "cet Utilisateur"}`
          : "Créer un Nouvel Utilisateur"}
      </h1>
    </div>
  )
}
