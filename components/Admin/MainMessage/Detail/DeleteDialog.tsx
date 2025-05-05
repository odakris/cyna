import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"

interface DeleteDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export default function DeleteDialog({
  isOpen,
  setIsOpen,
  onConfirm,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Êtes-vous sûr de vouloir supprimer ce message ? Cette action ne peut
            pas être annulée.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2 flex-col sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
            className="text-xs sm:text-sm w-full sm:w-auto"
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="text-xs sm:text-sm w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Confirmer la suppression
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
