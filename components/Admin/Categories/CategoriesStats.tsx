import { Card, CardContent } from "@/components/ui/card"
import { Package, Sparkles, Layers, ShoppingBag } from "lucide-react"

interface CategoriesStatsProps {
  stats: {
    total: number
    withProducts: number
    withoutProducts: number
    highPriority: number
  }
}

export default function CategoriesStats({ stats }: CategoriesStatsProps) {
  return (
    <>
      {/* Version desktop - inchangée */}
      <div className="hidden md:grid md:grid-cols-1 md:sm:grid-cols-2 md:md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Catégories
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Package className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Avec Produits
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.withProducts}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Sans Produits
              </p>
              <p className="text-2xl font-bold text-gray-500">
                {stats.withoutProducts}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Layers className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Priorité Haute
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.highPriority}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version mobile - nouvelle version */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Catégories
              </p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
            <Package className="h-6 w-6 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Avec Produits
              </p>
              <p className="text-xl font-bold text-green-600">
                {stats.withProducts}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <ShoppingBag className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Sans Produits
              </p>
              <p className="text-xl font-bold text-gray-500">
                {stats.withoutProducts}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Layers className="h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Priorité Haute
              </p>
              <p className="text-xl font-bold text-blue-600">
                {stats.highPriority}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
