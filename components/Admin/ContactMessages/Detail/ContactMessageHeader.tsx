import Link from "next/link"
import { ArrowLeft, Reply, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import PermissionGuard from "../../../Auth/PermissionGuard"

interface ContactMessageHeaderProps {
  setShowDeleteDialog: (show: boolean) => void
  messageId: string
}

export default function ContactMessageHeader({
  setShowDeleteDialog,
  messageId,
}: ContactMessageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
        >
          <Link href="/dashboard/contact">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-3xl font-bold">Détails du message</h1>
      </div>

      <div className="flex gap-2">
        <PermissionGuard permission="contact:respond">
          <Button
            asChild
            className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
          >
            <Link href={`/dashboard/contact/${messageId}/respond`}>
              <Reply className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Répondre</span>
            </Link>
          </Button>
        </PermissionGuard>
        <PermissionGuard permission="contact:delete">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
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
