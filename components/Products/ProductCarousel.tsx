"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import type {
  EmblaCarouselType as CarouselApi,
  EmblaOptionsType,
} from "embla-carousel"

// Type plus flexible qui peut accepter différents formats d'images
type ProductImage = {
  id_product_caroussel_image?: number
  url: string
  alt?: string | null
}

type ProductCarouselProps = {
  images: ProductImage[] | undefined
  mainImage?: string
  objectFit?: "cover" | "contain"
}

export function ProductCarousel({
  images,
  mainImage,
  objectFit = "cover",
}: ProductCarouselProps) {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  // Options pour le carousel
  const options: EmblaOptionsType = {
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
  }

  // Référence au plugin d'autoplay
  const plugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: images && images.length > 1,
    })
  )

  useEffect(() => {
    if (!api) return

    // Initialiser l'index actuel
    setCurrent(api.selectedScrollSnap())

    // Mettre à jour l'index lorsque le carrousel change
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Si aucune image n'est fournie ou si le tableau est vide, afficher l'image principale
  if (!images || images.length === 0) {
    if (!mainImage) {
      return (
        <div className="w-full h-[300px] sm:h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Aucune image disponible</p>
        </div>
      )
    }

    // Afficher uniquement l'image principale
    return (
      <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden rounded-md">
        <Image
          src={mainImage}
          alt="Image principale du produit"
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          className={`object-${objectFit}`}
          onError={e => {
            // Fallback image en cas d'erreur
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.png"
            target.onerror = null
          }}
        />
      </div>
    )
  }

  return (
    <Carousel
      plugins={images.length > 1 ? [plugin.current] : []}
      className="w-full"
      onMouseEnter={images.length > 1 ? plugin.current.stop : undefined}
      onMouseLeave={images.length > 1 ? () => plugin.current.play() : undefined}
      setApi={setApi}
      opts={options}
    >
      <CarouselContent>
        {images.map((image, index) => (
          <CarouselItem key={image.id_product_caroussel_image || index}>
            <div className="relative w-full h-[300px] sm:h-[400px] overflow-hidden rounded-md">
              <Image
                src={image.url}
                alt={image.alt || "Image du produit"}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                priority
                className={`object-${objectFit}`}
                onError={e => {
                  // Fallback image en cas d'erreur
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.png"
                  target.onerror = null
                }}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Indicateurs de navigation - uniquement si plus d'une image */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                current === index ? "bg-[#302082] scale-125" : "bg-[#302082]/50"
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Flèches de navigation - uniquement si plus d'une image */}
      {images.length > 1 && (
        <>
          <CarouselPrevious className="left-4 bg-white/80 hover:bg-white border-0" />
          <CarouselNext className="right-4 bg-white/80 hover:bg-white border-0" />
        </>
      )}
    </Carousel>
  )
}
