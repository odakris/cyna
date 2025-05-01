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
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/contact">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Détails du message</h1>
      </div>

      <div className="flex gap-2">
        <PermissionGuard permission="contact:respond">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/contact/${messageId}/respond`}>
              <Reply className="mr-2 h-4 w-4" />
              Répondre
            </Link>
          </Button>
        </PermissionGuard>
        <PermissionGuard permission="contact:delete">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
