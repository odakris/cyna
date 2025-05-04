import Link from "next/link"
import { User } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface UserHeaderProps {
  user: User
  handleEdit: () => void
  setIsDeleteDialogOpen: (isOpen: boolean) => void
  getRoleBadgeColor: (role: string) => string
}

export default function UserHeader({
  user,
  handleEdit,
  setIsDeleteDialogOpen,
}: UserHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
        <div>
          <h1 className="text-xl sm:text-3xl font-bold">
            Détails de l&apos;Utilisateur
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-none">
            {user.first_name} {user.last_name}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <PermissionGuard permission="users:edit">
          <Button
            onClick={handleEdit}
            className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
          >
            <Edit className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:inline">Modifier</span>
          </Button>
        </PermissionGuard>

        <PermissionGuard permission="users:delete">
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
          >
            <Trash2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="sm:inline">Supprimer</span>
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
