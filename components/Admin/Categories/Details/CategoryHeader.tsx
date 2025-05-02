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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">
              Détails et produits associés
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/categories/${category.id_category}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir sur le site
            </Link>
          </Button>

          <PermissionGuard permission="categories:edit">
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="categories:delete">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </div>
  )
}
