"use client"

import React from "react"
import { ProductType } from "../../types/Types"
import { ProductCard } from "@/components/ProductCard/ProductCard"

export function ProductGrid({ products }: { products: ProductType[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id_product} {...product} />
      ))}
    </div>
  )
}
