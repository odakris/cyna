import React from "react"
import Image from "next/image"
import Link from "next/link"
import { useCategories } from "@/hooks/use-categories"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { CategoryWithProductCount } from "@/types/frontend-types"

export function CategoryGrid() {
  const { categories, loading, errorMessage } = useCategories()

  if (errorMessage) {
    return (
      <div className="w-full p-6 text-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-500 border border-red-200">
          <p className="text-sm font-medium">
            {errorMessage ?? "Erreur lors du chargement des catégories"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="w-full h-60 rounded-lg" />
          ))
        : categories
            .filter(cat => cat.active)
            .map(category => (
              <CategoryCard key={category.id_category} category={category} />
            ))}
    </div>
  )
}

interface CategoryCardProps {
  category: CategoryWithProductCount
}

function CategoryCard({ category }: CategoryCardProps) {
  const productCount = category._count?.products || 0

  return (
    <Link
      href={`/categorie/${category.id_category}`}
      passHref
      className="block transform transition-all duration-300 hover:scale-[1.02]"
    >
      <Card className="group overflow-hidden h-full cursor-pointer hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-[#302082]">
        <CardContent className="p-0 relative">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={category.image || `/images/cyber${category.id_category}.jpg`}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent group-hover:from-[#302082]/70 transition-colors duration-300" />
          </div>

          <div className="absolute bottom-0 left-0 w-full p-4 text-white">
            <div className="flex items-end justify-between">
              <h3 className="text-xl font-bold mb-1 drop-shadow-md">
                {category.name}
              </h3>

              {productCount > 0 && (
                <Badge className="bg-[#302082] text-white group-hover:bg-[#FF6B00] transition-colors duration-300">
                  {productCount} produit{productCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
