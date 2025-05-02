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
          <BotMessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Chatbot Conversations
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {conversationsCount} conversation{conversationsCount > 1 ? "s" : ""}
          </Badge>
          <Badge
            variant="secondary"
            className="font-normal"
            title="Sélectionnées"
          >
            {selectedCount} sélectionnée
            {selectedCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <PermissionGuard permission="conversations:delete">
          <Button
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer ({selectedCount})
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
