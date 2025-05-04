import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Category } from "@prisma/client"
import PermissionGuard from "@/components/Auth/PermissionGuard"
import { ArrowLeft, Edit, Trash2, ExternalLink } from "lucide-react"

interface CategoryHeaderProps {
  category: Category
  setIsDeleteDialogOpen: (isOpen: boolean) => void
  handleEdit: () => void
}

export default function CategoryHeader({
  category,
  setIsDeleteDialogOpen,
  handleEdit,
}: CategoryHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold truncate max-w-[200px] sm:max-w-none">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Détails et produits associés
            </p>
          </div>
        </div>

        {/* Boutons d'action - disposition mobile adaptée */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
          >
            <Link href={`/categorie/${category.id_category}`} target="_blank">
              <ExternalLink className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Voir sur le site</span>
              <span className="hidden sm:inline"></span>
            </Link>
          </Button>

          <PermissionGuard permission="categories:edit">
            <Button
              onClick={handleEdit}
              className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
            >
              <Edit className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Modifier</span>
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="categories:delete">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
            >
              <Trash2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Supprimer</span>
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  )
}
