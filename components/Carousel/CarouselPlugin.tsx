"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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
import { HeroCarouselSlide } from "@prisma/client"

export function CarouselPlugin() {
  const [slides, setSlides] = useState<HeroCarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
      playOnInit: true,
    })
  )

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/hero-carousel")

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des slides")
        }

        const data = await response.json()
        // Filtrer uniquement les slides actifs et les trier par ordre de priorité
        const activeSlides = data
          .filter((slide: HeroCarouselSlide) => slide.active)
          .sort(
            (a: HeroCarouselSlide, b: HeroCarouselSlide) =>
              a.priority_order - b.priority_order
          )

        setSlides(activeSlides)
      } catch (err) {
        console.error("Erreur lors du chargement du carousel:", err)
        setError("Impossible de charger le carousel")
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()
  }, [])

  useEffect(() => {
    if (!api) return

    // Initialiser l'index actuel
    setCurrent(api.selectedScrollSnap())

    // Mettre à jour l'index lorsque le carrousel change
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })

    // S'assurer que l'autoplay fonctionne correctement
    api.on("init", () => {
      plugin.current.play()
    })

    // Forcer l'autoplay à redémarrer après la dernière diapositive
    api.on("reInit", () => {
      plugin.current.play()
    })
  }, [api])

  // État de chargement
  if (loading) {
    return (
      <div className="w-full h-96 bg-muted/30 animate-pulse rounded-md flex items-center justify-center">
        <p className="text-muted-foreground">Chargement du carousel...</p>
      </div>
    )
  }

  // En cas d'erreur ou aucun slide actif
  if (error || slides.length === 0) {
    return null // Ne rien afficher
  }

  return (
    <div className="w-full">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={() => plugin.current.play()}
        setApi={setApi}
        opts={options}
      >
        <CarouselContent>
          {slides.map(slide => (
            <CarouselItem key={slide.id_hero_slide}>
              <div className="relative h-96 w-full overflow-hidden rounded-md">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                  onError={e => {
                    // Fallback image en cas d'erreur
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.png"
                    target.onerror = null
                  }}
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-10 md:px-20">
                  <div className="max-w-lg text-white">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      {slide.title}
                    </h2>
                    {slide.description && (
                      <p className="text-lg mb-6">{slide.description}</p>
                    )}
                    {slide.button_text && slide.button_link && (
                      <Link href={slide.button_link}>
                        <Button size="lg" className="font-semibold">
                          {slide.button_text}
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Indicateurs de navigation */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                current === index ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>

        <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/50 border-0" />
        <CarouselNext className="right-4 bg-white/20 hover:bg-white/50 border-0" />
      </Carousel>
    </div>
  )
}
