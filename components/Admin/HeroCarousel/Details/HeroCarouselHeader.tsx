import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroCarouselSlide } from "@prisma/client"
import PermissionGuard from "@/components/Auth/PermissionGuard"
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react"

interface HeroCarouselHeaderProps {
  slide: HeroCarouselSlide
  setIsDeleteDialogOpen: (isOpen: boolean) => void
  handleEdit: () => void
}

export default function HeroCarouselHeader({
  slide,
  setIsDeleteDialogOpen,
  handleEdit,
}: HeroCarouselHeaderProps) {
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
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold truncate max-w-[200px] sm:max-w-none">
              {slide.title}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Slide Carousel
              </span>
              <span>•</span>
              <span>ID: #{slide.id_hero_slide}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Voir sur le site</span>
            </Link>
          </Button>

          <PermissionGuard permission="hero-carousel:edit">
            <Button
              onClick={handleEdit}
              className="flex-1 sm:flex-auto text-xs sm:text-sm h-9"
            >
              <Edit className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="sm:inline">Modifier</span>
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="hero-carousel:delete">
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
