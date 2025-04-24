// components/ProductCard/ProductCard.tsx
import * as React from "react"
import { Product } from "@prisma/client"
import { BaseProductCard } from "./BaseProductCard"

export function ProductCard(product: Product) {
  return <BaseProductCard product={product} variant="default" />
}
