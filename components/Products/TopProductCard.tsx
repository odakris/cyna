import React from "react"
import { FeaturedProduct } from "@/types/frontend-types"
import { BaseProductCard } from "@/components/Products/BaseProductCard"

interface TopProductCardProps {
  product: FeaturedProduct
}

export function TopProductCard({ product }: TopProductCardProps) {
  return <BaseProductCard product={product} variant="featured" />
}
