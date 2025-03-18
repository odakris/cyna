import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { CategoryType } from "../../types/Types"
import { Skeleton } from "../ui/skeleton"

export function CategoryGrid() {
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await fetch(`/api/categories`)
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des catégories")
        const data: CategoryType[] = await response.json()
        setCategories(data)
      } catch (error) {
        setError("Erreur lors de la récupération des catégories")
        console.error("Erreur :", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllCategories()
  }, [])

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error ?? "Catégories non trouvées."}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-60 rounded-lg" />
          ))
        : categories.map(category => (
            <Card
              key={category.id_category}
              href={`/categorie/${category.id_category}`}
            >
              <CardContent className="relative p-0">
                <Image
                  src={`/images/cyber${category.id_category}.jpg`}
                  alt={category.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                  width={400}
                  height={240}
                />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <h2 className="text-white text-lg font-bold drop-shadow-lg">
                    {category.name}
                  </h2>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  )
}
