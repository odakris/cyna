"use client"

import React, { useEffect, useState } from "react"
import { ProductCard } from "@/components/ProductCard/ProductCard"
import { ProductType } from "../../app/types"
import { Skeleton } from "../ui/skeleton"

export function TopProducts() {
  const [allProducts, setAllProducts] = useState<ProductType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true)

  useEffect(() => {
    const fetchAllAvailableProducts = async () => {
      try {
        const response = await fetch(`/api/products`)
        if (!response.ok)
          throw new Error("Erreur lors de la récupération du produit")
        const data: [ProductType] = await response.json()
        setAllProducts(data)
      } catch (error) {
        setError("Erreur lors de la récupération du produit")
        console.error("Erreur lors de la récupération du produit :", error)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchAllAvailableProducts()
  }, [])

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error ?? "Produit non trouvé."}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
      {loadingProducts
        ? Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-60 rounded-lg" />
          ))
        : allProducts
            .slice(0, 4)
            .map(product => (
              <ProductCard
                key={`${product.id_produit}-${product.nom}`}
                {...product}
              />
            ))}
    </div>
  )
}
