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

interface UserDeleteDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  userName: string
  onConfirm: () => Promise<void>
}

export default function UserDeleteDialog({
  isOpen,
  setIsOpen,
  userName,
  onConfirm,
}: UserDeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer l&apos;utilisateur &quot;
            {userName}&quot; ? Cette action est irréversible.
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
