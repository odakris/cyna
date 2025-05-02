import Link from "next/link"
import { ArrowLeft, Clock, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { ConversationStatus } from "@prisma/client"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface ConversationDetailHeaderProps {
  conversationId: number
  status: ConversationStatus
  updateStatus: (status: ConversationStatus) => void
  statusUpdating: boolean
  handleBack: () => void
  setShowDeleteDialog?: (show: boolean) => void
}

export default function ConversationDetailHeader({
  status,
  updateStatus,
  statusUpdating,
  setShowDeleteDialog,
}: ConversationDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/contact">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Détails de la conversation</h1>
      </div>

      <div className="flex items-center gap-3">
        {statusUpdating ? (
          <Clock className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Select
              value={status}
              onValueChange={val => updateStatus(val as ConversationStatus)}
              disabled={statusUpdating}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="PENDING_ADMIN">En attente</SelectItem>
                <SelectItem value="CLOSED">Fermé</SelectItem>
              </SelectContent>
            </Select>

            {setShowDeleteDialog && (
              <PermissionGuard permission="contact:delete">
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </PermissionGuard>
            )}
          </>
        )}
      </div>
    </div>
  )
}
