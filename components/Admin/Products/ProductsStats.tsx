import { Card, CardContent } from "@/components/ui/card"
import { Package, Sparkles, AlertTriangle } from "lucide-react"

interface ProductsStatsProps {
  stats: {
    total: number
    available: number
    unavailable: number
    lowStock: number
  }
}

export default function ProductsStats({ stats }: ProductsStatsProps) {
  return (
    <>
      {/* Version desktop - STRICTEMENT INCHANGÉE */}
      <div className="hidden md:grid md:grid-cols-1 md:sm:grid-cols-2 md:md:grid-cols-4 md:gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Produits
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
                Disponibles
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.available}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Indisponibles
              </p>
              <p className="text-2xl font-bold text-gray-500">
                {stats.unavailable}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Stock Faible
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.lowStock}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Version mobile - UNIQUEMENT POUR MOBILE */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Total Produits
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
                Disponibles
              </p>
              <p className="text-xl font-bold text-green-600">
                {stats.available}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Indisponibles
              </p>
              <p className="text-xl font-bold text-gray-500">
                {stats.unavailable}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Stock Faible
              </p>
              <p className="text-xl font-bold text-amber-600">
                {stats.lowStock}
              </p>
            </div>
            <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
