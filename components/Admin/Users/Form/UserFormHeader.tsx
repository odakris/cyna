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
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
      >
        <Link href="/dashboard/users">
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Link>
      </Button>
      <h1 className="text-xl sm:text-3xl font-bold">
        {isEditing
          ? `Modifier ${userName || "cet Utilisateur"}`
          : "Créer un Nouvel Utilisateur"}
      </h1>
    </div>
  )
}
