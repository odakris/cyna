import { Card, CardContent } from "@/components/ui/card"
import { LayoutList, Sparkles, AlertTriangle } from "lucide-react"

interface HeroCarouselStatsProps {
  stats: {
    total: number
    active: number
    inactive: number
    highPriority: number
  }
}

export default function HeroCarouselStats({ stats }: HeroCarouselStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total Slides
            </p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <LayoutList className="h-8 w-8 text-primary opacity-80" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Actifs</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
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
              Inactifs
            </p>
            <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-gray-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
