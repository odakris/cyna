// components/ProductGrid/ProductGrid.tsx
import React from "react"
import { Product } from "@prisma/client"
import { ProductCard } from "@/components/Products/ProductCard"
import { BaseProductGrid } from "./BaseProductGrid"

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
  const filteredProducts = products.filter(product => product.active)
  return (
    <BaseProductGrid
      loading={loading}
      isEmpty={products.length === 0}
      emptyMessage={emptyMessage}
    >
      {filteredProducts.map(product => (
        <ProductCard key={product.id_product} {...product} />
      ))}
    </BaseProductGrid>
  )
}
