import React from "react"
import { Product } from "@prisma/client"
import { ProductCard } from "@/components/Products/ProductCard"
import { BaseProductGrid } from "./BaseProductGrid"
import { sortActiveProducts } from "@/lib/utils/product-utils"

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
  // const filteredProducts = products.filter(product => product.active)
  const filteredProducts = sortActiveProducts(products)
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
