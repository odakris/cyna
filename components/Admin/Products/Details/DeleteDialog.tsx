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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer le produit &quot;
            {productName}&quot; ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="mr-2 h-4 w-4" />
            Confirmer la suppression
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
