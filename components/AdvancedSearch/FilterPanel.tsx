"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"
import { FilterPanelProps } from "@/types/Types"

export function FilterPanel({
  title,
  description,
  features,
  priceRange,
  priceInput,
  selectedCategory,
  onlyAvailable,
  categories,
  handlers,
}: FilterPanelProps) {
  return (
    <Card className="lg:col-span-3 hidden lg:block h-fit sticky top-24">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <SlidersHorizontal className="mr-2 h-5 w-5" /> Filtres
        </h2>

        <form onSubmit={handlers.handleSearch} className="space-y-6">
          {/* Texte du titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={e => handlers.setTitle(e.target.value)}
              placeholder="Rechercher par titre..."
              className="border-[#302082]/30 focus:border-[#302082]"
            />
          </div>

          {/* Texte de la description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={e => handlers.setDescription(e.target.value)}
              placeholder="Rechercher dans les descriptions..."
              className="border-[#302082]/30 focus:border-[#302082]"
            />
          </div>

          {/* Caractéristiques techniques */}
          <div className="space-y-2">
            <Label htmlFor="features">Caractéristiques techniques</Label>
            <Input
              id="features"
              value={features}
              onChange={e => handlers.setFeatures(e.target.value)}
              placeholder="Rechercher dans les caractéristiques..."
              className="border-[#302082]/30 focus:border-[#302082]"
            />
          </div>

          {/* Prix */}
          <div className="space-y-4">
            <Label>Prix</Label>
            <div className="pt-2 px-1">
              <Slider
                value={priceRange}
                min={0}
                max={10000}
                step={100}
                onValueChange={handlers.handlePriceRangeChange}
                className="my-6"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="minPrice" className="text-xs">
                  Min
                </Label>
                <Input
                  id="minPrice"
                  value={priceInput.min}
                  onChange={e =>
                    handlers.handlePriceInputChange("min", e.target.value)
                  }
                  className="border-[#302082]/30 focus:border-[#302082]"
                />
              </div>
              <div className="space-y-2 flex-1">
                <Label htmlFor="maxPrice" className="text-xs">
                  Max
                </Label>
                <Input
                  id="maxPrice"
                  value={priceInput.max}
                  onChange={e =>
                    handlers.handlePriceInputChange("max", e.target.value)
                  }
                  className="border-[#302082]/30 focus:border-[#302082]"
                />
              </div>
            </div>
          </div>

          {/* Catégories */}
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select
              value={selectedCategory}
              onValueChange={handlers.setSelectedCategory}
            >
              <SelectTrigger
                id="category"
                className="border-[#302082]/30 focus:border-[#302082]"
              >
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem
                    key={category.id_category}
                    value={category.id_category.toString()}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Uniquement disponibles */}
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="onlyAvailable"
              checked={onlyAvailable}
              onCheckedChange={checked =>
                handlers.setOnlyAvailable(checked as boolean)
              }
            />
            <Label htmlFor="onlyAvailable" className="cursor-pointer">
              Uniquement services disponibles
            </Label>
          </div>

          {/* Boutons d'action */}
          <div>
            <Button type="submit" className="w-full" variant={"cyna"}>
              <Search className="mr-2 h-4 w-4" /> Rechercher
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlers.resetFilters}
              className="text-gray-500 my-2 w-full"
            >
              Réinitialiser
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
