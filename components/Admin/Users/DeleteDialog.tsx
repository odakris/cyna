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
import { Trash2 } from "lucide-react"

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de supprimer {selectedCount} utilisateur
            {selectedCount > 1 ? "s" : ""}. Cette action ne peut pas être
            annulée.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Confirmer la suppression
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
