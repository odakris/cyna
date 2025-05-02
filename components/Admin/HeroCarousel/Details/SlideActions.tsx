import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { HeroCarouselSlide } from "@prisma/client"
import {
  Layers,
  CheckCircle2,
  XCircle,
  Calendar,
  CalendarDays,
  BarChart3,
} from "lucide-react"

interface SlideActionsProps {
  slide: HeroCarouselSlide
  formatDate: (dateString: string) => string
  onStatusChange: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function SlideActions({
  slide,
  formatDate,
  onStatusChange,
}: SlideActionsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Informations
          </CardTitle>
          <CardDescription>Détails du slide</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Statut
            </p>
            <div className="flex items-center justify-between mt-1">
              <div>
                {slide.active ? (
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Actif
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-red-200 text-red-600 bg-red-50"
                  >
                    <XCircle className="mr-1 h-3 w-3" />
                    Inactif
                  </Badge>
                )}
              </div>
              <Switch checked={slide.active} onCheckedChange={onStatusChange} />
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Priorité d&apos;affichage
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={
                  slide.priority_order <= 3
                    ? "bg-red-100 text-red-700 border-red-200"
                    : slide.priority_order <= 7
                      ? "bg-amber-100 text-amber-700 border-amber-200"
                      : "bg-blue-100 text-blue-700 border-blue-200"
                }
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                {slide.priority_order}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {slide.priority_order <= 3
                  ? "(Haute priorité)"
                  : slide.priority_order <= 7
                    ? "(Priorité moyenne)"
                    : "(Priorité standard)"}
              </span>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Dernière mise à jour
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(slide.updated_at.toString())}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Date de création
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              {formatDate(slide.created_at.toString())}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
