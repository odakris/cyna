"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical } from "lucide-react"
import Image from "next/image"
import { CategoryType } from "../../app/types"
import { Skeleton } from "../ui/skeleton"

export function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Trier les catégories directement lors du rendu
  // const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await fetch(`/api/categories`)
        if (!response.ok)
          throw new Error("Erreur lors de la récupération du produit")
        const data: CategoryType[] = await response.json()
        setCategories(data)
      } catch (error) {
        setError("Erreur lors de la récupération du produit")
        console.error("Erreur lors de la récupération du produit :", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllCategories()
  }, [])

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error ?? "Categories non trouvé."}
      </p>
    )
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}
    >
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-60 rounded-lg" />
          ))
        : categories.map(category => (
            <Card
              key={category.id_categorie}
              className="relative overflow-hidden cursor-pointer rounded-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
            >
              <CardContent className="p-0">
                {/* Image */}
                <Image
                  src={`/images/cyber${category.id_categorie}.jpg`}
                  alt={category.nom}
                  className="w-full h-48 object-cover rounded-t-lg"
                  width={400}
                  height={240}
                />

                {/* Overlay with title */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <h2 className="text-white text-lg font-bold drop-shadow-lg">
                    {category.nom}
                  </h2>
                </div>
              </CardContent>

              {/* Edit Button */}
              <Button
                variant="ghost"
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 p-2 rounded-full"
                onClick={() => console.log(`Editing ${category.nom}`)}
              >
                <GripVertical className="h-5 w-5 text-white" />
              </Button>
            </Card>
          ))}
    </div>
  )
}
