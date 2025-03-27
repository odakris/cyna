"use client"

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { type CarouselApi } from "@/components/ui/carousel"

interface CarouselPluginProps {
  images?: Array<{
    url: string
    alt?: string
  }> | null
}

export function CarouselPlugin({ images }: CarouselPluginProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  )

  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  // Surveiller le changement de diapositive active
  React.useEffect(() => {
    if (!api) {
      return
    }

    // Initialiser l'index actuel
    setCurrent(api.selectedScrollSnap())

    // Mettre à jour l'index lorsque le carrousel change
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Vérifier si images est défini et non vide
  if (!images || images.length === 0) {
    return (
      <div className="w-full mx-auto my-6">
        <Card className="overflow-hidden">
          <CardContent className="flex aspect-square items-center justify-center p-0 w-full h-60">
            <p className="text-muted-foreground">Aucune image disponible</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto my-6">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={setApi}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-full">
              <Card className="overflow-hidden border-0">
                <CardContent className="flex aspect-square items-center justify-center p-0 w-full h-60">
                  <div className="relative w-full h-full">
                    <Image
                      src={image.url || "/placeholder.png"}
                      alt={image.alt || `Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 672px"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.png"
                        target.onerror = null
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-between items-center mt-2">
          <CarouselPrevious className="relative left-0 right-auto transform-none" />
          <div className="flex gap-2 justify-center">
            {images.map((_, index) => (
              <button
                key={`indicator-${index}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  current === index ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                aria-label={`Aller à l'image ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
          <CarouselNext className="relative right-0 left-auto transform-none" />
        </div>
      </Carousel>
    </div>
  )
}
