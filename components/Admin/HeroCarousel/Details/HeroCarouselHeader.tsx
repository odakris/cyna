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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{slide.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Slide Carousel
              </span>
              <span>•</span>
              <span>ID: #{slide.id_hero_slide}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/" target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir sur le site
            </Link>
          </Button>

          <PermissionGuard permission="hero-carousel:edit">
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </PermissionGuard>

          <PermissionGuard permission="hero-carousel:delete">
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
