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

interface ContactMessageDeleteDialogProps {
  showDeleteDialog: boolean
  setShowDeleteDialog: (show: boolean) => void
  selectedCount: number
  onConfirm: () => void
}

export default function ContactMessageDeleteDialog({
  showDeleteDialog,
  setShowDeleteDialog,
  selectedCount,
  onConfirm,
}: ContactMessageDeleteDialogProps) {
  return (
    <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de supprimer {selectedCount} message
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
