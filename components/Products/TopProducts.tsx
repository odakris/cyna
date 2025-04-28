import React from "react"
import { useTopProducts } from "@/hooks/use-top-products"
import { BaseProductGrid } from "@/components/Products/BaseProductGrid"
import { TopProductCard } from "./TopProductCard"

export function TopProducts() {
  const productCardNumber: number = 6
  const { products, loading, error } = useTopProducts(productCardNumber)

  if (error) {
    return (
      <div className="w-full p-4 sm:p-6 text-center">
        <div className="rounded-lg bg-red-50 p-3 sm:p-4 text-red-500 border border-red-200">
          <p className="text-xs sm:text-sm font-medium">
            {error ?? "Erreur lors du chargement des produits vedettes"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <BaseProductGrid
      loading={loading}
      isEmpty={products.length === 0}
      emptyMessage="Aucun produit vedette disponible actuellement."
      skeletonCount={productCardNumber}
    >
      {products.map(product => (
        <TopProductCard key={product.id_product} product={product} />
      ))}
    </BaseProductGrid>
  )
}
