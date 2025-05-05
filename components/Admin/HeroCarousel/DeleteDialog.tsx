import { Trash2 } from "lucide-react"
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

interface DeleteDialogProps {
  showDeleteDialog: boolean
  setShowDeleteDialog: (show: boolean) => void
  selectedCount: number
  onConfirm: () => void
}

export default function DeleteDialog({
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
            Vous êtes sur le point de supprimer {selectedCount} slide
            {selectedCount > 1 ? "s" : ""}. Cette action ne peut pas être
            annulée.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="text-xs sm:text-sm">
              Annuler
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="text-xs sm:text-sm"
          >
            <Trash2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Confirmer la suppression
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
