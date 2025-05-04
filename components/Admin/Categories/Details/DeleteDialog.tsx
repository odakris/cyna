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
      <DialogContent className="sm:max-w-md max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Confirmer la suppression
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Êtes-vous sûr de vouloir supprimer la catégorie &quot;
            {categoryName}&quot; ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        {productCount > 0 && (
          <div className="my-3 sm:my-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-600 flex items-center text-xs sm:text-sm">
              <ShieldAlert className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Attention: Cette catégorie contient {productCount} produit
              {productCount > 1 ? "s" : ""}. La suppression affectera tous ces
              produits.
            </p>
          </div>
        )}

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
