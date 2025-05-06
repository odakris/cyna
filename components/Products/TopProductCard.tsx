import React from "react"
import { BaseProductCard } from "@/components/Products/BaseProductCard"
import { Product } from "@prisma/client"

interface TopProductCardProps {
  product: Product
}

export function TopProductCard({ product }: TopProductCardProps) {
  return <BaseProductCard product={product} variant="featured" />
}
