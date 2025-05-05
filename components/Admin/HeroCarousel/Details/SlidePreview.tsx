import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HeroCarouselSlide } from "@prisma/client"
import { MonitorSmartphone, ImageIcon, ExternalLink, Edit } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface SlidePreviewProps {
  slide: HeroCarouselSlide
  handleEdit: () => void
}

export default function SlidePreview({ slide, handleEdit }: SlidePreviewProps) {
  return (
    <>
      <Card>
        <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <MonitorSmartphone className="h-4 w-4 sm:h-5 sm:w-5" />
            Aperçu du slide
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Visualisation du slide tel qu&apos;il apparaît sur la page
            d&apos;accueil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
          <div className="relative rounded-lg overflow-hidden h-64 sm:h-96 w-full bg-slate-100">
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-4 sm:p-8">
              <div className="max-w-lg text-white">
                <h2 className="text-xl sm:text-3xl font-bold mb-2 sm:mb-4">
                  {slide.title}
                </h2>
                {slide.description && (
                  <p className="text-base sm:text-lg mb-3 sm:mb-6">
                    {slide.description}
                  </p>
                )}
                {slide.button_text && slide.button_link && (
                  <Button size="sm" className="sm:size-lg">
                    {slide.button_text}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {slide.description ||
                  "Aucune description disponible pour ce slide."}
              </p>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">
                Bouton d&apos;action
              </h3>
              {slide.button_text && slide.button_link ? (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground w-fit">
                    {slide.button_text}
                  </Badge>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    Lien: {slide.button_link}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Aucun bouton configuré pour ce slide.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 sm:mt-6">
        <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Source de l&apos;image
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Détails de l&apos;image utilisée dans le slide
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-muted-foreground break-all">
              URL: <span className="font-mono">{slide.image_url}</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2">
              <Button
                onClick={handleEdit}
                className="text-xs sm:text-sm"
                size="sm"
              >
                <Edit className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Changer l&apos;image
              </Button>
              <Button
                variant="outline"
                asChild
                className="text-xs sm:text-sm"
                size="sm"
              >
                <Link href={slide.image_url} target="_blank">
                  <ExternalLink className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Voir l&apos;image originale
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
