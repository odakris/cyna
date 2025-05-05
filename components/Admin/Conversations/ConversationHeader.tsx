import { BotMessageSquare, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface ConversationHeaderProps {
  conversationsCount: number
  selectedCount: number
  setShowDeleteDialog: (show: boolean) => void
}

export default function ConversationHeader({
  conversationsCount,
  selectedCount,
  setShowDeleteDialog,
}: ConversationHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <BotMessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Chatbot Conversations
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {conversationsCount} conversation{conversationsCount > 1 ? "s" : ""}
          </Badge>
          <Badge
            variant="secondary"
            className="font-normal hidden md:inline-flex"
            title="Sélectionnées"
          >
            {selectedCount} sélectionnée
            {selectedCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="hidden md:flex flex-wrap gap-3">
        <PermissionGuard permission="conversations:delete">
          <Button
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setShowDeleteDialog(true)}
            className="text-xs sm:text-sm"
          >
            <Trash2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Supprimer ({selectedCount})
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
