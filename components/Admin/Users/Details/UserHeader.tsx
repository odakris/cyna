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
  handleEdit,
  setIsDeleteDialogOpen,
}: UserHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Détails de l&apos;Utilisateur</h1>
      </div>
      <div className="flex gap-2">
        <PermissionGuard permission="users:edit">
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </PermissionGuard>

        <PermissionGuard permission="users:delete">
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
