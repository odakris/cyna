import Link from "next/link"
import { TagIcon, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import PermissionGuard from "@/components/Auth/PermissionGuard"

interface CategoriesHeaderProps {
  categoriesCount: number
  selectedCount: number
  setShowDeleteDialog: (show: boolean) => void
}

export default function CategoriesHeader({
  categoriesCount,
  selectedCount,
  setShowDeleteDialog,
}: CategoriesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <TagIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Gestion des Catégories
          </h1>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="outline" className="font-normal">
            {categoriesCount} catégorie{categoriesCount > 1 ? "s" : ""}
          </Badge>
          {/* Badge de sélection - uniquement visible sur desktop */}
          <Badge
            variant="secondary"
            className="font-normal hidden md:inline-flex"
            title="Sélectionnées"
          >
            {selectedCount} sélectionnée{selectedCount > 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <PermissionGuard permission="categories:create">
          <Button asChild className="flex-1 sm:flex-auto">
            <Link href="/dashboard/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="sm:inline">Ajouter</span>
              <span className="hidden sm:inline"> une catégorie</span>
            </Link>
          </Button>
        </PermissionGuard>

        {/* Bouton supprimer - uniquement visible sur desktop */}
        <PermissionGuard permission="categories:delete">
          <Button
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setShowDeleteDialog(true)}
            className="hidden md:flex"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer ({selectedCount})
          </Button>
        </PermissionGuard>
      </div>
    </div>
  )
}
