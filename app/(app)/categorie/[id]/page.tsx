"use client"

import React from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useCategoryProducts } from "@/hooks/use-category-products"
import { ProductGrid } from "@/components/Products/ProductGrid"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryPage() {
  const params = useParams()
  const { category, loading, error } = useCategoryProducts(params?.id)

  if (error) {
    return (
      <div className="w-full p-4 sm:p-6 text-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-500 border border-red-200">
          <p className="text-sm font-medium">
            {error ?? "Erreur lors du chargement de la catégorie"}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <Skeleton className="w-full h-40 sm:h-60 md:h-72 rounded-lg" />
        <Skeleton className="w-3/4 h-6 sm:h-8" />
        <Skeleton className="w-full h-24 sm:h-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-48 sm:h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // Vérification que le produit existe et est actif
  if (!category || !category.active) {
    return (
      <div className="w-full p-4 sm:p-6 text-center">
        <div className="rounded-lg bg-amber-50 p-4 text-amber-700 border border-amber-200">
          <p className="text-sm font-medium">Catégorie non trouvé</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="w-full p-4 sm:p-6 text-center">
        <div className="rounded-lg bg-amber-50 p-4 text-amber-700 border border-amber-200">
          <p className="text-sm font-medium">Catégorie non trouvée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="sm:p-6 space-y-6 sm:space-y-8">
      <div className="relative h-40 sm:h-60 md:h-72 rounded-lg overflow-hidden shadow-md">
        <Image
          src={category.image || `/images/cyber${category.id_category}.jpg`}
          alt={`Catégorie ${category.name}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end p-4 sm:p-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 text-center drop-shadow-lg">
            {category.name}
          </h1>
          <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 text-sm sm:text-base rounded-full border border-white/30">
            {category._count?.products || category.products?.length || 0}{" "}
            produit
            {category._count?.products !== 1 || category.products?.length !== 1
              ? "s"
              : ""}
          </div>
        </div>
      </div>

      {category.description && (
        <div className="max-w-4xl mx-auto bg-gray-50 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-primary mb-2 sm:mb-3 relative pb-2 inline-block">
            À propos de cette catégorie
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mt-3 sm:mt-4 whitespace-pre-line">
            {category.description}
          </p>
        </div>
      )}

      <div className="mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6 relative pb-2 inline-block">
          Produits disponibles
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h2>

        {category.products && category.products.length > 0 ? (
          <ProductGrid products={category.products} />
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            Aucun produit disponible dans cette catégorie pour le moment.
          </div>
        )}
      </div>
    </div>
  )
}
