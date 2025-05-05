import { Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeleteDialogProps {
  showDeleteDialog: boolean
  setShowDeleteDialog: (show: boolean) => void
  selectedCount: number
  onConfirm: () => void
}

export default function MainMessageDeleteDialog({
  showDeleteDialog,
  setShowDeleteDialog,
  selectedCount,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Vous êtes sur le point de supprimer {selectedCount} message
            {selectedCount > 1 ? "s" : ""}. Cette action ne peut pas être
            annulée.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs sm:text-sm">
            La suppression est définitive et peut affecter l&apos;affichage sur
            le site.
          </AlertDescription>
        </Alert>

        <DialogFooter className="mt-4 flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="text-xs sm:text-sm w-full sm:w-auto"
            >
              Annuler
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="text-xs sm:text-sm w-full sm:w-auto"
          >
            <Trash2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Confirmer la suppression
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
