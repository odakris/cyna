"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductGrid } from "@/components/ProductGrid/ProductGrid"

export default function CategoryPage() {
  const [category, setCategory] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const params = useParams()

  useEffect(() => {
    const id = params?.id

    if (id) {
      const fetchCategory = async () => {
        try {
          const response = await fetch(`/api/categories/${id}`)
          if (!response.ok) {
            throw new Error("Erreur lors de la récupération de la catégorie")
          }
          const data = await response.json()
          setCategory(data)
        } catch (error) {
          console.error(
            "Erreur lors de la récupération de la catégorie :",
            error
          )
        } finally {
          setLoading(false)
        }
      }

      fetchCategory()
    }
  }, [params])

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Skeleton className="w-full h-[300px] rounded-lg" />
      </div>
    )
  }

  if (!category) {
    return <p>Catégorie non trouvée</p>
  }

  return (
    <div className="p-6">
      <div className="relative h-72 mb-6">
        <Image
          src={`/images/cyber${category.id_category}.jpg`}
          alt={`Bandeau de la catégorie ${category.name}`} // Use 'name' instead of 'nom'
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h2 className="text-white text-lg font-bold drop-shadow-lg">
            {category.name} {/* Use 'name' instead of 'nom' */}
          </h2>
        </div>
      </div>

      <p className="mb-8">
        {category.description || "Pas de description disponible"}
      </p>

      {/* Pass 'products' instead of 'produits' */}
      <ProductGrid products={category.products || []} />
    </div>
  )
}
