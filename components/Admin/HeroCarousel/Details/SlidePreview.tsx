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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MonitorSmartphone className="h-5 w-5" />
            Aperçu du slide
          </CardTitle>
          <CardDescription>
            Visualisation du slide tel qu&apos;il apparaît sur la page
            d&apos;accueil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative rounded-lg overflow-hidden h-96 w-full bg-slate-100">
            <Image
              src={slide.image_url}
              alt={slide.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-8">
              <div className="max-w-lg text-white">
                <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                {slide.description && (
                  <p className="text-lg mb-6">{slide.description}</p>
                )}
                {slide.button_text && slide.button_link && (
                  <Button size="lg">{slide.button_text}</Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {slide.description ||
                  "Aucune description disponible pour ce slide."}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Bouton d&apos;action
              </h3>
              {slide.button_text && slide.button_link ? (
                <div className="flex flecx-col items-center gap-2">
                  <Badge className="bg-primary text-primary-foreground">
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

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Source de l&apos;image
          </CardTitle>
          <CardDescription>
            Détails de l&apos;image utilisée dans le slide
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground break-all">
              URL: <span className="font-mono">{slide.image_url}</span>
            </p>
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Button onClick={handleEdit} className="text-sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Changer l&apos;image
                </Button>
                <Button variant="outline" asChild className="text-sm">
                  <Link href={slide.image_url} target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Voir l&apos;image originale
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
