import { Mail, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface ContactMessageHeaderProps {
  messagesCount: number
  selectedCount: number
  setShowDeleteDialog: (show: boolean) => void
}

export default function ContactMessageHeader({
  messagesCount,
  selectedCount,
  setShowDeleteDialog,
}: ContactMessageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Messages de Contact
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {messagesCount} message{messagesCount > 1 ? "s" : ""}
          </Badge>
          {/* Badge de sélection - affichage conditionnel selon la taille d'écran */}
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
        <PermissionGuard permission="contact:delete">
          <Button
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setShowDeleteDialog(true)}
            className="hidden md:flex" // Masqué sur mobile, visible sur desktop
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer ({selectedCount})
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
