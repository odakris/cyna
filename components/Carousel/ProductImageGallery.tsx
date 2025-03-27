"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { cn } from "@/lib/utils"
import { type CarouselApi } from "@/components/ui/carousel"

interface ImageType {
  url: string
  alt?: string
  id_product_caroussel_image?: number
}

interface ProductImageGalleryProps {
  images: ImageType[]
  productName: string
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  // Une ref pour auto-scroller la miniature active dans la vue
  const thumbnailsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Effet pour scroller la miniature active dans la vue
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.querySelector(
        `[data-index="${current}"]`
      )
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [current])

  if (!images || images.length === 0) {
    return (
      <div className="bg-muted/5 border border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
        <p className="text-muted-foreground flex flex-col items-center gap-2">
          <span className="text-4xl">🖼️</span>
          Aucune image disponible pour ce produit
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Carousel principal - Taille réduite avec max-width limité */}
      <div className="flex justify-center">
        <Carousel
          setApi={setApi}
          className="w-full max-w-md mx-auto"
          opts={{ loop: true }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem
                key={`carousel-${index}`}
                className="flex justify-center"
              >
                <div className="p-1 w-full max-w-xs">
                  <AspectRatio
                    ratio={4 / 3}
                    className="bg-muted rounded-lg overflow-hidden"
                  >
                    <Image
                      src={image.url || "/placeholder.png"}
                      alt={image.alt || `Image ${index + 1} de ${productName}`}
                      fill
                      className="cover object-center rounded-lg"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 400px"
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.png"
                        target.onerror = null
                      }}
                    />
                  </AspectRatio>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex items-center justify-center gap-4 mt-4">
            <CarouselPrevious className="relative left-0 right-auto transform-none hover:bg-primary hover:text-primary-foreground" />
            <CarouselNext className="relative right-0 left-auto transform-none hover:bg-primary hover:text-primary-foreground" />
          </div>
        </Carousel>
      </div>

      {/* Miniatures avec meilleur centrage */}
      <div className="mt-6 px-2 relative flex justify-center">
        <div
          ref={thumbnailsRef}
          className="flex gap-2 overflow-x-auto py-2 px-1 snap-x scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-muted/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full max-w-md mx-auto justify-center"
          style={{
            scrollbarWidth: "thin",
            msOverflowStyle: "none",
          }}
        >
          {images.map((image, index) => (
            <div
              key={`thumb-${index}`}
              data-index={index}
              className={cn(
                "flex-shrink-0 w-14 h-14 overflow-hidden rounded-md border transition-all cursor-pointer snap-start",
                current === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => api?.scrollTo(index)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.url || "/placeholder.png"}
                  alt={image.alt || `Miniature ${index + 1} de ${productName}`}
                  fill
                  className="object-cover"
                  sizes="56px"
                  onError={e => {
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.png"
                    target.onerror = null
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
