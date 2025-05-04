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
import { FilterPanelProps } from "@/types/Types"
import { formatEuro } from "@/lib/utils/format"

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
    <Card className="lg:col-span-3 hidden lg:block h-fit sticky top-24 border-0 shadow-lg">
      <CardContent className="p-6 bg-white rounded-xl border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-[#302082] flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-5 w-5"
          >
            <line x1="4" x2="20" y1="21" y2="21"></line>
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="3" y2="3"></line>
            <line x1="8" x2="8" y1="21" y2="16"></line>
            <line x1="12" x2="12" y1="12" y2="7"></line>
            <line x1="16" x2="16" y1="3" y2="8"></line>
          </svg>
          Filtres de recherche
        </h2>

        <form onSubmit={handlers.handleSearch} className="space-y-6">
          {/* Texte du titre */}
          <div className="space-y-2">
            <Label htmlFor="title" className="font-medium text-gray-700">
              Titre du produit
            </Label>
            <Input
              id="title"
              value={title}
              onChange={e => handlers.setTitle(e.target.value)}
              placeholder="Rechercher par titre..."
              className="border-[#302082]/30 focus:border-[#302082] transition-colors"
            />
          </div>

          {/* Texte de la description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="font-medium text-gray-700">
              Description
            </Label>
            <Input
              id="description"
              value={description}
              onChange={e => handlers.setDescription(e.target.value)}
              placeholder="Rechercher dans les descriptions..."
              className="border-[#302082]/30 focus:border-[#302082] transition-colors"
            />
          </div>

          {/* Caractéristiques techniques */}
          <div className="space-y-2">
            <Label htmlFor="features" className="font-medium text-gray-700">
              Caractéristiques techniques
            </Label>
            <Input
              id="features"
              value={features}
              onChange={e => handlers.setFeatures(e.target.value)}
              placeholder="Rechercher dans les caractéristiques..."
              className="border-[#302082]/30 focus:border-[#302082] transition-colors"
            />
          </div>

          {/* Prix */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="font-medium text-gray-700">Prix</Label>
              <span className="text-sm text-[#302082] font-medium">
                {formatEuro(priceRange[0])} - {formatEuro(priceRange[1])}
              </span>
            </div>
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
                <Label htmlFor="minPrice" className="text-xs text-gray-500">
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
                <Label htmlFor="maxPrice" className="text-xs text-gray-500">
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
            <Label htmlFor="category" className="font-medium text-gray-700">
              Catégorie
            </Label>
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
              className="text-[#302082] border-[#302082]/50"
            />
            <Label
              htmlFor="onlyAvailable"
              className="cursor-pointer text-gray-700"
            >
              Uniquement services disponibles
            </Label>
          </div>

          {/* Boutons d'action */}
          <div className="pt-4 space-y-3">
            <Button
              type="submit"
              className="w-full text-white py-2.5 shadow-sm hover:shadow-md transition-all"
              variant="cyna"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 h-4 w-4"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              Rechercher
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handlers.resetFilters}
              className="w-full border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
