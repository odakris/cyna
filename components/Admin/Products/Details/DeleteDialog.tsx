import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"

interface DeleteDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  productName: string
  onConfirm: () => Promise<void>
}

export default function DeleteDialog({
  isOpen,
  setIsOpen,
  productName,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Êtes-vous sûr de vouloir supprimer le produit &quot;{productName}
            &quot; ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="text-xs sm:text-sm"
          >
            Annuler
          </Button>
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
