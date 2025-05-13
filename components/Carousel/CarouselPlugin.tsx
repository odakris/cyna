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
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"

export function CarouselPlugin() {
  const [slides, setSlides] = useState<HeroCarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const [animate, setAnimate] = useState(false)

  // Options pour le carousel
  const options: EmblaOptionsType = {
    loop: true,
    align: "center",
    containScroll: "trimSnaps",
  }

  // Référence au plugin d'autoplay
  const plugin = React.useRef(
    Autoplay({
      delay: 6000, // Légèrement plus long pour une meilleure expérience
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      playOnInit: true,
    })
  )

  useEffect(() => {
    // Animation d'entrée
    const animationTimer = setTimeout(() => setAnimate(true), 100)

    // Récupération des slides
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
        // console.error("Erreur lors du chargement du carousel:", err)
        setError("Impossible de charger le carousel")
      } finally {
        setLoading(false)
      }
    }

    fetchSlides()

    return () => clearTimeout(animationTimer)
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
      <div className="w-full h-[500px] bg-gradient-to-r from-[#302082]/5 to-[#302082]/10 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-[#302082] border-t-transparent"></div>
          <p className="mt-4 text-[#302082] font-medium">
            Chargement des tendances...
          </p>
        </div>
      </div>
    )
  }

  // En cas d'erreur ou aucun slide actif
  if (error || slides.length === 0) {
    return null // Ne rien afficher
  }

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden shadow-xl transition-all duration-700 ${animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={() => plugin.current.play()}
        setApi={setApi}
        opts={options}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id_hero_slide}>
              <div className="relative h-[400px] sm:h-[450px] md:h-[500px] w-full overflow-hidden">
                {/* Image du slide avec effet de zoom léger */}
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  priority
                  className={`object-cover transform transition-transform duration-10000 ${
                    current === index ? "scale-105" : "scale-100"
                  }`}
                  onError={e => {
                    // Fallback image en cas d'erreur
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.png"
                    target.onerror = null
                  }}
                />

                {/* Overlay avec dégradé amélioré */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#302082]/80 via-[#302082]/50 to-transparent flex flex-col justify-center px-8 sm:px-16 md:px-24">
                  <div
                    className={`max-w-xl transition-all duration-1000 delay-300 transform ${
                      current === index
                        ? "translate-x-0 opacity-100"
                        : "translate-x-10 opacity-0"
                    }`}
                  >
                    <div className="inline-flex px-3 py-1 mb-4 bg-[#FF6B00] text-white text-sm rounded-full font-medium">
                      Nouveau
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">
                      {slide.title}
                    </h2>
                    {slide.description && (
                      <p className="text-base sm:text-lg mb-6 text-white/90 drop-shadow-sm max-w-md">
                        {slide.description}
                      </p>
                    )}
                    {slide.button_text && slide.button_link && (
                      <Link href={slide.button_link}>
                        <Button
                          size="lg"
                          className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] transition-colors duration-300 font-semibold"
                        >
                          {slide.button_text}{" "}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Indicateurs de navigation améliorés */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index
                  ? "bg-[#FF6B00] scale-125 shadow-md"
                  : "bg-white/60 hover:bg-white/80"
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Boutons de navigation redessinés */}
        <CarouselPrevious className="left-4 h-10 w-10 bg-white/15 hover:bg-white/30 border-0 backdrop-blur-sm shadow-lg transition-all duration-300">
          <ChevronLeft className="h-6 w-6 text-white" />
        </CarouselPrevious>
        <CarouselNext className="right-4 h-10 w-10 bg-white/15 hover:bg-white/30 border-0 backdrop-blur-sm shadow-lg transition-all duration-300">
          <ChevronRight className="h-6 w-6 text-white" />
        </CarouselNext>

        {/* Progress bar animée */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
          <div
            className="h-full bg-[#FF6B00] transition-all duration-300"
            style={{
              width: `${((current + 1) / slides.length) * 100}%`,
            }}
          ></div>
        </div>
      </Carousel>
    </div>
  )
}
