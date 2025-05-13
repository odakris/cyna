"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
// import Image from "next/image"
import { ArrowRight, Shield, Info, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryGrid } from "@/components/CategoryGrid/CategoryGrid"

export default function CategoriesPage() {
  const [animate, setAnimate] = useState(false)

  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    categories: useRef<HTMLElement>(null),
    advantages: useRef<HTMLElement>(null),
    cta: useRef<HTMLElement>(null),
  }

  const [animateSections, setAnimateSections] = useState({
    hero: false,
    categories: false,
    advantages: false,
    cta: false,
  })

  useEffect(() => {
    // Animation initiale
    const timer = setTimeout(() => setAnimate(true), 100)

    // Observer pour les animations au scroll
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observerCallback: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id as keyof typeof animateSections
          setAnimateSections(prev => ({ ...prev, [sectionId]: true }))
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observer toutes les sections
    Object.entries(sectionRefs).forEach(([, ref]) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-24 pb-16">
      {/* Hero Section */}
      <section
        id="hero"
        ref={sectionRefs.hero}
        className={`relative rounded-xl overflow-hidden shadow-lg h-52 sm:h-64 md:h-80 transition-all duration-700 ${
          animateSections.hero
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        {/* Image de fond avec effet parallaxe */}
        <div className="absolute inset-0 transform hover:scale-105 transition-transform duration-5000">
          {/* <Image
            src="/images/categories-hero.jpg"
            alt="Nos catégories de produits et services"
            fill
            className="object-cover"
            priority
          /> */}
        </div>

        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#302082]/90 via-[#302082]/60 to-transparent"></div>

        {/* Contenu texte */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col items-center justify-end text-center">
          <div className="inline-block bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 shadow-md">
            <div className="flex items-center">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              Solutions de sécurité
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Nos Catégories de Solutions
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-sm sm:text-base">
            Découvrez notre gamme complète de solutions de cybersécurité
            adaptées aux besoins de votre entreprise
          </p>
        </div>
      </section>

      {/* Introduction Section */}
      <section
        className={`max-w-4xl mx-auto px-4 transition-all duration-700 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-4 relative inline-block pb-2">
            Protection complète pour votre entreprise
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Chez CYNA, nous vous proposons des solutions de cybersécurité
            adaptées à vos besoins spécifiques. Explorez nos différentes
            catégories pour trouver la protection idéale pour votre
            infrastructure.
          </p>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section
        id="categories"
        ref={sectionRefs.categories}
        className={`px-4 transition-all duration-700 ${
          animateSections.categories
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-6 relative pb-2 inline-block">
            Explorer nos catégories
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <CategoryGrid />
        </div>
      </section>

      {/* Advantages Section */}
      <section
        id="advantages"
        ref={sectionRefs.advantages}
        className={`px-4 py-8 bg-gray-50 border-y border-gray-200 transition-all duration-700 ${
          animateSections.advantages
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-8 text-center relative pb-2 inline-block">
            Pourquoi choisir nos solutions
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Advantage 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-[#302082]/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#302082]/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#302082]/20 transition-colors">
                <Shield className="h-7 w-7 text-[#302082]" />
              </div>
              <h3 className="text-xl font-bold text-[#302082] mb-3 group-hover:translate-x-0.5 transition-transform">
                Solutions intégrées
              </h3>
              <p className="text-gray-600">
                Nos catégories de produits sont conçues pour travailler en
                synergie, offrant une protection complète et cohérente de votre
                système d&apos;information.
              </p>
            </div>

            {/* Advantage 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-[#302082]/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#302082]/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#302082]/20 transition-colors">
                <Info className="h-7 w-7 text-[#302082]" />
              </div>
              <h3 className="text-xl font-bold text-[#302082] mb-3 group-hover:translate-x-0.5 transition-transform">
                Expertise spécialisée
              </h3>
              <p className="text-gray-600">
                Chaque catégorie représente un domaine d&apos;expertise
                spécifique, avec des solutions développées par des spécialistes
                pour répondre aux menaces actuelles.
              </p>
            </div>

            {/* Advantage 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-[#302082]/30 transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#302082]/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#302082]/20 transition-colors">
                <ArrowRight className="h-7 w-7 text-[#302082]" />
              </div>
              <h3 className="text-xl font-bold text-[#302082] mb-3 group-hover:translate-x-0.5 transition-transform">
                Évolutivité garantie
              </h3>
              <p className="text-gray-600">
                Nos solutions dans chaque catégorie sont conçues pour évoluer
                avec votre entreprise et s&apos;adapter aux nouvelles menaces de
                cybersécurité.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        ref={sectionRefs.cta}
        className={`max-w-7xl mx-auto px-4 transition-all duration-700 ${
          animateSections.cta
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <div className="bg-gradient-to-r from-[#302082] to-[#231968] rounded-xl p-8 sm:p-10 text-white text-center shadow-lg transform transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold mb-4">
            Besoin d&apos;un conseil personnalisé ?
          </h3>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Nos experts sont disponibles pour vous guider dans le choix des
            solutions adaptées à vos besoins spécifiques
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className=" shadow-md" variant={"cyna"}>
              <Link href="/contact">Demander une démo</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white hover:bg-white text-[#302082] transition-colors"
            >
              <Link href="/produit">Explorer nos produits</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
