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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link
                href={`/dashboard/categories/${category?.id_category}`}
                className="hover:text-primary hover:underline flex items-center gap-1"
              >
                <Tag className="h-3.5 w-3.5" />
                {category?.name || "Non catégorisé"}
              </Link>
              <span>•</span>
              <span>Réf: #{product.id_product}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href={`/produit/${product.id_product}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir sur le site
            </Link>
          </Button>

          <PermissionGuard permission="products:edit">
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="products:delete">
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
