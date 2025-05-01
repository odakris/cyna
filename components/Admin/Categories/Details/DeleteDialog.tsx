import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ShieldAlert, Trash2 } from "lucide-react"

interface DeleteDialogProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  categoryName: string
  productCount: number
  onConfirm: () => Promise<void>
}

export default function DeleteDialog({
  isOpen,
  setIsOpen,
  categoryName,
  productCount,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer la catégorie &quot;
            {categoryName}&quot; ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        {productCount > 0 && (
          <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-600 flex items-center">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Attention: Cette catégorie contient {productCount} produit
              {productCount > 1 ? "s" : ""}. La suppression affectera tous ces
              produits.
            </p>
          </div>
        )}

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
