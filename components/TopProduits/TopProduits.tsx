"use client"

import * as React from "react"
import { ProductCard } from "@/components/ProductCard/ProductCard"

interface Product {
  id: number
  title: string
  name: string
  description: string
  image: string
  stock: number 
  price: string
}

interface TopProductsProps {
  products: Product[]
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
      {products.map(product => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}
