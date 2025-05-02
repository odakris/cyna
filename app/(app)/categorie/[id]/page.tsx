"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useCategoryProducts } from "@/hooks/category/use-category-products"
import { ProductGrid } from "@/components/Products/ProductGrid"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Shield,
  Info,
  Tag,
  FileText,
  AlertTriangle,
} from "lucide-react"

export default function CategoryPage() {
  const params = useParams()
  const { category, loading, error } = useCategoryProducts(params?.id)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    // Trigger animation after initial render
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  if (error) {
    return (
      <div className="w-full p-6 sm:p-8 mx-auto max-w-4xl">
        <div className="rounded-lg bg-red-50 p-6 text-red-600 border border-red-200 shadow-sm flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Erreur lors du chargement
            </h3>
            <p className="text-sm font-medium">
              {error ??
                "Erreur lors du chargement de la catégorie. Veuillez réessayer ultérieurement."}
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 mx-auto max-w-7xl animate-pulse">
        <Skeleton className="w-full h-48 sm:h-64 md:h-80 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="w-1/3 h-8 sm:h-10" />
          <Skeleton className="w-full h-24 sm:h-32 max-w-4xl" />
        </div>
        <div className="mt-8">
          <Skeleton className="w-1/4 h-7 mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full h-52 sm:h-64 rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Vérification que la catégorie existe et est active
  if (!category || !category.active) {
    return (
      <div className="w-full p-6 sm:p-8 mx-auto max-w-4xl">
        <div className="rounded-lg bg-amber-50 p-6 text-amber-700 border border-amber-200 shadow-sm flex items-start gap-3">
          <Info className="h-6 w-6 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg mb-2">
              Catégorie non trouvée
            </h3>
            <p className="text-sm font-medium">
              La catégorie que vous recherchez n&apos;existe pas ou n&apos;est
              plus disponible.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-4 border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l&apos;accueil
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`space-y-8 sm:space-y-12 mx-auto max-w-7xl pb-8 transition-all duration-700 ${animate ? "opacity-100" : "opacity-0"}`}
    >
      {/* Hero Banner */}
      <div className="relative rounded-xl overflow-hidden shadow-lg h-52 sm:h-64 md:h-80">
        {/* Image de fond avec effet parallaxe */}
        <div className="absolute inset-0 transform hover:scale-105 transition-transform duration-5000">
          <Image
            src={category.image || `/images/cyber${category.id_category}.jpg`}
            alt={`Catégorie ${category.name}`}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Overlay dégradé */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#302082]/90 via-[#302082]/60 to-transparent"></div>

        {/* Navigation */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 text-white/80">
          <Link href="/" className="hover:text-white transition-colors text-sm">
            Accueil
          </Link>
          <span className="text-white/50">/</span>
          <span className="text-white text-sm font-medium">
            {category.name}
          </span>
        </div>

        {/* Contenu texte */}
        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col items-center justify-end text-center">
          <div className="inline-block bg-[#FF6B00] text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium mb-3 shadow-md">
            <div className="flex items-center">
              <Tag className="h-3.5 w-3.5 mr-1.5" />
              Catégorie
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
            {category.name}
          </h1>
          <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 text-xs sm:text-sm rounded-full border border-white/30 flex items-center">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            {category._count?.products || category.products?.length || 0}{" "}
            produit
            {category._count?.products !== 1 || category.products?.length !== 1
              ? "s"
              : ""}
          </div>
        </div>
      </div>

      {/* Description de la catégorie */}
      {category.description && (
        <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100 transform transition-all duration-500 hover:shadow-lg">
          <div className="flex items-start gap-4">
            <div className="rounded-full p-3 bg-[#302082]/10 flex-shrink-0">
              <Info className="h-5 w-5 text-[#302082]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#302082] mb-4 relative pb-2">
                À propos de cette catégorie
                <span className="absolute bottom-0 left-0 w-32 h-1 bg-[#302082] rounded"></span>
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {category.description}
              </p>

              {/* Badges des caractéristiques */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="bg-[#302082]/5 text-[#302082] text-sm px-3 py-1 rounded-full">
                  Sécurité maximale
                </span>
                <span className="bg-[#302082]/5 text-[#302082] text-sm px-3 py-1 rounded-full">
                  Support 24/7
                </span>
                <span className="bg-[#302082]/5 text-[#302082] text-sm px-3 py-1 rounded-full">
                  Mise à jour régulière
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Section des produits */}
      <div>
        <div className="flex justify-between items-center mb-6 sm:mb-8 px-4 sm:px-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#302082] relative pb-2">
            Produits disponibles
            <span className="absolute bottom-0 left-0 w-24 sm:w-32 h-1 bg-[#302082] rounded"></span>
          </h2>

          <Button
            asChild
            variant="outline"
            className="hidden sm:flex border-[#302082] text-[#302082] hover:bg-[#302082] hover:text-white transition-colors"
          >
            <Link href="/contact">
              <Shield className="mr-2 h-4 w-4" />
              Demander un devis
            </Link>
          </Button>
        </div>

        {category.products && category.products.length > 0 ? (
          <div className="px-4 sm:px-0">
            <ProductGrid products={category.products} />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200 flex flex-col items-center justify-center space-y-4">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700">
              Aucun produit disponible
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Il n&apos;y a actuellement aucun produit disponible dans cette
              catégorie. Veuillez consulter nos autres catégories ou nous
              contacter pour en savoir plus.
            </p>
            <div className="flex gap-4 mt-4">
              <Button
                asChild
                className="bg-[#302082] hover:bg-[#302082]/90 text-white"
              >
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Section CTA */}
      <div className="bg-gradient-to-r from-[#302082] to-[#231968] rounded-xl p-8 sm:p-10 text-white text-center mt-12 shadow-lg transform transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        <h3 className="text-xl sm:text-2xl font-bold mb-4">
          Besoin d&apos;une solution sur mesure ?
        </h3>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          Nos experts sont disponibles pour vous accompagner dans le choix de la
          solution adaptée à vos besoins spécifiques
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white shadow-md"
          >
            <Link href="/contact">Demander une démo</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white hover:bg-white text-[#302082] transition-colors"
          >
            <Link href="/contact">Nous contacter</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
