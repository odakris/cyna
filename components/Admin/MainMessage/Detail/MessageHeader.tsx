import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PencilLine, Trash2, ExternalLink } from "lucide-react"
import { MainMessage } from "@prisma/client"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface MessageHeaderProps {
  message: MainMessage
  setShowDeleteDialog: (show: boolean) => void
  handleEdit: () => void
}

export default function MessageHeader({
  setShowDeleteDialog,
  handleEdit,
}: MessageHeaderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/main-message">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Détails du Message</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir sur le site
            </Link>
          </Button>

          <PermissionGuard permission="main-message:edit">
            <Button onClick={handleEdit}>
              <PencilLine className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="main-message:delete">
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
    </div>
  )
}
