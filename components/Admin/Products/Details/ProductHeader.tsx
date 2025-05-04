import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductWithImages } from "@/types/Types"
import { Category } from "@prisma/client"
import PermissionGuard from "@/components/Auth/PermissionGuard"
import { ArrowLeft, Edit, Trash2, ExternalLink, Tag } from "lucide-react"

interface ProductHeaderProps {
  product: ProductWithImages
  category: Category | null
  setIsDeleteDialogOpen: (isOpen: boolean) => void
  handleEdit: () => void
}

export default function ProductHeader({
  product,
  category,
  setIsDeleteDialogOpen,
  handleEdit,
}: ProductHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Link
                href={`/dashboard/categories/${category?.id_category}`}
                className="hover:text-primary hover:underline flex items-center gap-1 truncate max-w-[80px] sm:max-w-none"
              >
                <Tag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {category?.name || "Non catégorisé"}
              </Link>
              <span>•</span>
              <span>Réf: #{product.id_product}</span>
            </div>
          </div>
        </div>

        {/* Boutons d'action - disposition mobile adaptée */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
          >
            <Link href={`/produit/${product.id_product}`} target="_blank">
              <ExternalLink className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Voir sur le site</span>
              <span className="hidden sm:inline"></span>
            </Link>
          </Button>

          <PermissionGuard permission="products:edit">
            <Button
              className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
              onClick={handleEdit}
            >
              <Edit className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Modifier</span>
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="products:delete">
            <Button
              variant="destructive"
              className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
              onClick={() => setIsDeleteDialogOpen(true)}
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
