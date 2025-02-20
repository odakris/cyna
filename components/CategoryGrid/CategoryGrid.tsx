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
  featured?: boolean
}

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  // Trier les catégories directement lors du rendu
  const sortedCategories = [...categories].sort((a, b) => a.order - b.order)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sortedCategories.map(category => (
        <Card
          key={category.id}
          className={`relative overflow-hidden cursor-pointer ${
            category.featured ? "border-2 border-primary shadow-lg" : ""
          }`}
        >
          <CardContent className="p-0">
            <Image
              src={category.image}
              alt={category.name}
              className="w-full h-40 object-cover"
              width={400}
              height={200}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-white text-lg font-bold">{category.name}</h2>
            </div>
          </CardContent>
          <Button
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => console.log(`Editing ${category.name}`)}
          >
            <GripVertical className="h-5 w-5 text-white" />
          </Button>
        </Card>
      ))}
    </div>
  )
}
