import Link from "next/link"
import { MessageSquareText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface MainMessageHeaderProps {
  messagesCount: number
  selectedCount: number
  setShowDeleteDialog: (show: boolean) => void
}

export default function MainMessageHeader({
  messagesCount,
  selectedCount,
  setShowDeleteDialog,
}: MainMessageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gestion des Messages Principaux
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {messagesCount} message{messagesCount > 1 ? "s" : ""}
          </Badge>
          <Badge
            variant="secondary"
            className="font-normal hidden md:inline-flex"
            title="Sélectionnés"
          >
            {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <PermissionGuard permission="main-message:create">
          <Button asChild className="flex-1 sm:flex-auto">
            <Link href="/dashboard/main-message/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="sm:inline">Ajouter</span>
              <span className="hidden sm:inline"> un message</span>
            </Link>
          </Button>
        </PermissionGuard>

        <PermissionGuard permission="main-message:delete">
          <Button
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setShowDeleteDialog(true)}
            className="hidden md:flex"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span className="sm:inline">Supprimer</span>
            <span className="hidden sm:inline"> ({selectedCount})</span>
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
