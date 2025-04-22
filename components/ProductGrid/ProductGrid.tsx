import React from "react"
import { Product } from "@prisma/client"
import { ProductCard } from "@/components/ProductCard/ProductCard"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductGridProps {
  products: Product[]
  loading?: boolean
  emptyMessage?: string
}

export function ProductGrid({
  products,
  loading = false,
  emptyMessage = "Aucun produit trouvé dans cette catégorie.",
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="w-full h-64 rounded-lg" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="w-full p-6 text-center">
        <div className="rounded-lg bg-gray-50 p-8 text-gray-500 border border-gray-200">
          <p className="text-base font-medium">{emptyMessage}</p>
          <p className="mt-2 text-sm">
            Veuillez consulter nos autres catégories de produits.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id_product} {...product} />
      ))}
    </div>
  )
}
