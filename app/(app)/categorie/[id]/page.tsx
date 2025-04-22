"use client"

import React from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { useCategoryProducts } from "@/hooks/use-category-products"
import { ProductGrid } from "@/components/ProductGrid/ProductGrid"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoryPage() {
  const params = useParams()
  const { category, loading, error } = useCategoryProducts(params?.id)

  if (error) {
    return (
      <div className="w-full p-6 text-center">
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
      <div className="space-y-6 p-6">
        <Skeleton className="w-full h-72 rounded-lg" />
        <Skeleton className="w-3/4 h-8" />
        <Skeleton className="w-full h-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="w-full p-6 text-center">
        <div className="rounded-lg bg-amber-50 p-4 text-amber-700 border border-amber-200">
          <p className="text-sm font-medium">Catégorie non trouvée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* En-tête de la catégorie */}
      <div className="relative h-72 rounded-lg overflow-hidden shadow-md">
        <Image
          src={category.image || `/images/cyber${category.id_category}.jpg`}
          alt={`Catégorie ${category.name}`}
          layout="fill"
          objectFit="cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center justify-end p-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center drop-shadow-lg">
            {category.name}
          </h1>
          <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-1 rounded-full border border-white/30">
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
        <div className="max-w-4xl mx-auto bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-[#302082] mb-3 relative pb-2 inline-block">
            À propos de cette catégorie
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {category.description}
          </p>
        </div>
      )}

      {/* Grille de produits */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[#302082] mb-6 relative pb-2 inline-block">
          Produits disponibles
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h2>
        <ProductGrid products={category.products || []} />
      </div>
    </div>
  )
}
