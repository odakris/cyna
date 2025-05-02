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
import { Badge } from "@/components/ui/badge"

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
            Vous êtes sur le point de supprimer{" "}
            <Badge variant="outline" className="font-semibold mx-1">
              {selectedCount}
            </Badge>
            catégorie{selectedCount > 1 ? "s" : ""}. Cette action ne peut pas
            être annulée.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Si des produits sont associés à ces catégories, la suppression
            échouera.
          </AlertDescription>
        </Alert>
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
