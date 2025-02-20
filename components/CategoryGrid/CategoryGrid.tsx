"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GripVertical } from "lucide-react"
import Image from "next/image"

interface Category {
  id: number
  name: string
  image: string
  order: number
  // featured?: boolean
}

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Trier les catégories directement lors du rendu
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {sortedCategories.map(category => (
        <Card
          key={category.id}
          className={
            "relative overflow-hidden cursor-pointer rounded-lg transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
          }
        >
          <CardContent className="p-0">
            {/* Image */}
            <Image
              src={category.image}
              alt={category.name}
              className="w-full h-48 object-cover rounded-t-lg"
              width={400}
              height={240}
            />

            {/* Overlay avec le titre */}
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <h2 className="text-white text-lg font-bold drop-shadow-lg">
                {category.name}
              </h2>
            </div>
          </CardContent>

          {/* Bouton d'édition */}
          <Button
            variant="ghost"
            className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 p-2 rounded-full"
            onClick={() => console.log(`Editing ${category.name}`)}
          >
            <GripVertical className="h-5 w-5 text-white" />
          </Button>
        </Card>
      ))}
    </div>
  )
}
