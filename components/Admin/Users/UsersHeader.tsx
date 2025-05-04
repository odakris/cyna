import Link from "next/link"
import { Users, UserPlus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface UsersHeaderProps {
  usersCount: number
  selectedCount: number
  setShowDeleteDialog: (show: boolean) => void
}

export default function UsersHeader({
  usersCount,
  selectedCount,
  setShowDeleteDialog,
}: UsersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gestion des Utilisateurs
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {usersCount} utilisateur{usersCount > 1 ? "s" : ""}
          </Badge>
          {/* Badge de sélection - sur desktop ET mobile */}
          <Badge
            variant="secondary"
            className="font-normal hidden md:inline-flex"
            title="Sélectionnés"
          >
            {selectedCount} sélectionné
            {selectedCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <PermissionGuard permission="users:create">
          <Button asChild className="flex-1 sm:flex-auto">
            <Link href="/dashboard/users/new">
              <UserPlus className="mr-2 h-4 w-4" />
              <span className="sm:inline">Ajouter</span>
              <span className="hidden sm:inline"> un utilisateur</span>
            </Link>
          </Button>
        </PermissionGuard>

        <PermissionGuard permission="users:delete">
          {/* Bouton de suppression visible uniquement sur desktop */}
          <Button
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setShowDeleteDialog(true)}
            className="hidden md:flex" // Masqué sur mobile, visible sur desktop
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Supprimer ({selectedCount})</span>
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
