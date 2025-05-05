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
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            <Link href="/dashboard/main-message">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">Détails du Message</h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Voir sur le site</span>
            </Link>
          </Button>

          <PermissionGuard permission="main-message:edit">
            <Button
              onClick={handleEdit}
              className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
            >
              <PencilLine className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Modifier</span>
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="main-message:delete">
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
    </div>
  )
}
