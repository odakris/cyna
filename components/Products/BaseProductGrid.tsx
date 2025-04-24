// components/ProductGrid/BaseProductGrid.tsx
import React, { ReactNode } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface BaseProductGridProps {
  loading?: boolean
  emptyMessage?: string
  isEmpty?: boolean
  children: ReactNode
  skeletonCount?: number
}

export function BaseProductGrid({
  loading = false,
  emptyMessage = "Aucun produit trouvé.",
  isEmpty = false,
  children,
  skeletonCount = 8,
}: BaseProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Skeleton key={index} className="w-full h-64 rounded-lg" />
        ))}
      </div>
    )
  }

  if (isEmpty) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {children}
    </div>
  )
}
