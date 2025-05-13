"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin"
import { CategoryGrid } from "@/components/CategoryGrid/CategoryGrid"
import { TopProducts } from "@/components/Products/TopProducts"
import MainMessage from "@/components/MainMessage/MainMessage"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Target, Zap, CheckCircle } from "lucide-react"

export default function Home() {
  const [animateSection, setAnimateSection] = useState({
    mainMessage: false,
    categories: false,
    features: false,
    products: false,
    cta: false,
  })

  const sectionRefs = useRef({
    mainMessage: React.createRef<HTMLElement>(),
    categories: React.createRef<HTMLElement>(),
    features: React.createRef<HTMLElement>(),
    products: React.createRef<HTMLElement>(),
    cta: React.createRef<HTMLElement>(),
  }).current

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observerCallback: IntersectionObserverCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id as keyof typeof animateSection
          setAnimateSection(prev => ({ ...prev, [sectionId]: true }))
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe all sections
    Object.entries(sectionRefs).forEach(([, ref]) => {
      if (ref.current) {
        observer.observe(ref.current)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [sectionRefs])

  return (
    <div className="flex flex-col justify-center items-center min-h-screen md:space-y-16">
      {/* HERO SECTION WITH CAROUSEL */}
      <section className="w-full relative" aria-label="Carrousel promotionnel">
        <CarouselPlugin />
      </section>

      {/* MAIN MESSAGE */}
      <section
        id="mainMessage"
        ref={sectionRefs.mainMessage}
        className={`w-full my-4 bg-gradient-to-r from-indigo-50 to-white rounded-lg shadow-md p-6 transition-all duration-700 ${
          animateSection.mainMessage
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
        aria-label="Message principal"
      >
        <MainMessage />
      </section>

      {/* FEATURES SECTION */}
      <section
        id="features"
        ref={sectionRefs.features}
        className={`w-full py-8 px-4 transition-all duration-700 ${
          animateSection.features
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-4 relative inline-block pb-2">
              Pourquoi choisir CYNA
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FF6B00] rounded"></span>
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Nous proposons des solutions de sécurité conçues pour protéger
              efficacement vos systèmes d&apos;information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg hover:border-[#302082]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#302082]/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#302082]/20 transition-colors">
                <Shield className="h-7 w-7 text-[#302082]" />
              </div>
              <h3 className="text-xl font-bold text-[#302082] mb-3 group-hover:translate-x-0.5 transition-transform">
                Protection complète
              </h3>
              <p className="text-gray-600">
                Une sécurité à 360° pour protéger l&apos;ensemble de votre
                infrastructure contre les menaces modernes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg hover:border-[#302082]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#302082]/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#302082]/20 transition-colors">
                <Zap className="h-7 w-7 text-[#302082]" />
              </div>
              <h3 className="text-xl font-bold text-[#302082] mb-3 group-hover:translate-x-0.5 transition-transform">
                Performance optimale
              </h3>
              <p className="text-gray-600">
                Solutions légères qui protègent sans ralentir vos systèmes ou
                votre productivité.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg hover:border-[#302082]/30 transition-all duration-300">
              <div className="w-14 h-14 bg-[#302082]/10 rounded-lg flex items-center justify-center mb-5 group-hover:bg-[#302082]/20 transition-colors">
                <Target className="h-7 w-7 text-[#302082]" />
              </div>
              <h3 className="text-xl font-bold text-[#302082] mb-3 group-hover:translate-x-0.5 transition-transform">
                Suivi personnalisé
              </h3>
              <p className="text-gray-600">
                Accompagnement sur mesure et assistance par des experts pour
                répondre à vos besoins spécifiques.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section
        id="categories"
        ref={sectionRefs.categories}
        className={`w-full my-4 transition-all duration-700 ${
          animateSection.categories
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
        aria-label="Catégories de produits"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-3 relative inline-block pb-2">
            Nos Catégories
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Découvrez notre gamme complète de solutions de sécurité adaptées aux
            enjeux actuels
          </p>
        </div>
        <CategoryGrid />
        <div className="flex justify-center mt-8">
          <Button
            asChild
            className="bg-transparent text-[#302082] border-2 border-[#302082] hover:bg-[#302082] hover:text-white transition-colors"
          >
            <Link href="/categorie">
              Voir toutes nos catégories <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* TESTIMONIALS / TRUST SIGNALS */}
      <section className="w-full py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] relative inline-block pb-2">
              Ils nous font confiance
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
            </h2>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-3xl font-bold text-[#302082]">98%</p>
              <p className="text-sm text-gray-600">Taux de satisfaction</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-3xl font-bold text-[#302082]">100+</p>
              <p className="text-sm text-gray-600">Clients protégés</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-3xl font-bold text-[#302082]">24/7</p>
              <p className="text-sm text-gray-600">Support technique</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm text-center">
              <p className="text-3xl font-bold text-[#302082]">5 ans</p>
              <p className="text-sm text-gray-600">d&apos;expertise</p>
            </div>
          </div>
        </div>
      </section>

      {/* TOP PRODUCTS */}
      <section
        id="products"
        ref={sectionRefs.products}
        className={`w-full my-4 transition-all duration-700 ${
          animateSection.products
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
        aria-label="Produits vedettes"
      >
        <div className="mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-3 relative inline-block pb-2">
            Les Top Produits du moment
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Découvrez nos solutions de sécurité les plus populaires conçues pour
            protéger votre entreprise
          </p>
        </div>
        <TopProducts />
        <div className="flex justify-center mt-8">
          <Button
            asChild
            className="bg-transparent text-[#302082] border-2 border-[#302082] hover:bg-[#302082] hover:text-white transition-colors"
          >
            <Link href="/produit">
              Voir tous nos produits <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section
        id="cta"
        ref={sectionRefs.cta}
        className={`w-full bg-gradient-to-r from-[#302082] to-[#231968] text-white py-16 px-4 rounded-lg shadow-lg transition-all duration-700 ${
          animateSection.cta
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0"
        }`}
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            Prêt à sécuriser votre entreprise ?
          </h2>
          <p className="text-lg mb-8 text-white/90 max-w-xl mx-auto">
            Contactez-nous dès aujourd&apos;hui pour obtenir un audit gratuit de
            votre infrastructure
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="transition-all duration-300 shadow-lg"
              variant={"cyna"}
            >
              <Link href="/contact">
                Demander une démo <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#302082] transition-all duration-300"
            >
              <Link href="/contact">Nous contacter</Link>
            </Button>
          </div>

          {/* Key benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-white/90">Déploiement rapide</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-white/90">Support 24/7</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#FF6B00]" />
              <span className="text-white/90">Solutions personnalisées</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
