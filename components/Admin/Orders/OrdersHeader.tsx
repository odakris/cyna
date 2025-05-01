import Link from "next/link"
import { ShoppingCartIcon, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface OrdersHeaderProps {
  ordersCount: number
  selectedCount: number
  setShowDeleteDialog: (show: boolean) => void
}

export default function OrdersHeader({
  ordersCount,
  selectedCount,
  setShowDeleteDialog,
}: OrdersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <ShoppingCartIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Gestion des Commandes
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {ordersCount} commande{ordersCount > 1 ? "s" : ""}
          </Badge>
          <Badge
            variant="secondary"
            className="font-normal"
            title="Sélectionnés"
          >
            {selectedCount} sélectionné
            {selectedCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <PermissionGuard permission="orders:create">
          <Button asChild>
            <Link href="/dashboard/orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Créer une commande
            </Link>
          </Button>
        </PermissionGuard>

        <PermissionGuard permission="orders:delete">
          <Button
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer ({selectedCount})
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
