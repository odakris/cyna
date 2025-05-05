import Link from "next/link"
import { ArrowLeft, Clock, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select"
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
  // status,
  // updateStatus,
  statusUpdating,
  setShowDeleteDialog,
}: ConversationDetailHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
        >
          <Link href="/dashboard/conversations">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-3xl font-bold truncate">
          Détails de la conversation
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {statusUpdating ? (
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
        ) : (
          <>
            {/* <Select
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
            </Select> */}

            {setShowDeleteDialog && (
              <PermissionGuard permission="contact:delete">
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                >
                  <Trash className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="inline">Supprimer</span>
                </Button>
              </PermissionGuard>
            )}
          </>
        )}
      </div>
    </div>
  )
}
