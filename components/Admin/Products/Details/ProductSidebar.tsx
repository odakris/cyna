import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductWithImages } from "@/types/Types"
import { Category } from "@prisma/client"
import ProductActiveSwitch from "@/components/Admin/Products/ProductActiveSwitch"
import { ShoppingBag, Layers, CalendarDays, Calendar } from "lucide-react"

interface ProductSidebarProps {
  product: ProductWithImages
  category: Category | null
  formatDate: (dateString: string) => string
  onStatusChange?: (newStatus: boolean) => void
}

export default function ProductSidebar({
  product,
  category,
  formatDate,
  onStatusChange,
}: ProductSidebarProps) {
  return (
    <div className="lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Informations
          </CardTitle>
          <CardDescription>Détails techniques du produit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Stock</p>
            <div className="flex items-center justify-between">
              <p className="font-semibold">{product.stock} unités</p>
              <Badge
                variant={product.stock > 0 ? "outline" : "destructive"}
                className={
                  product.stock > 0
                    ? product.stock <= 5
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-green-100 text-green-800 border-green-200"
                    : ""
                }
              >
                {product.stock === 0
                  ? "Rupture"
                  : product.stock <= 5
                    ? "Critique"
                    : product.stock <= 10
                      ? "Faible"
                      : "Bon"}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Catégorie
            </p>
            <div className="flex items-center justify-between">
              <p className="font-semibold">
                {category?.name || "Non catégorisé"}
              </p>
              <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                <Link href={`/dashboard/categories/${category?.id_category}`}>
                  <Layers className="h-3.5 w-3.5 mr-1" />
                  Voir
                </Link>
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Priorité d&apos;affichage
            </p>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  product.priority_order <= 3
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : product.priority_order <= 7
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200"
                }
              >
                {product.priority_order}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {product.priority_order <= 3
                  ? "(Haute priorité)"
                  : product.priority_order <= 7
                    ? "(Priorité moyenne)"
                    : "(Priorité standard)"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">Statut du produit</p>
              <Badge
                variant={product.active ? "default" : "outline"}
                className={
                  product.active
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {product.active ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <ProductActiveSwitch
              productId={product.id_product}
              initialActive={product.active}
              onStatusChange={onStatusChange}
            />
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Dernière mise à jour
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              {formatDate(product.updated_at.toString())}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Date de création
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formatDate(product.created_at.toString())}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
