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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { MobileFilterPanelProps } from "@/types/Types"
import { formatEuro } from "@/lib/utils/format"

export function MobileFilterPanel({
  title,
  description,
  features,
  priceRange,
  priceInput,
  selectedCategory,
  onlyAvailable,
  categories,
  isFilterMenuOpen,
  setIsFilterMenuOpen,
  handlers,
}: MobileFilterPanelProps) {
  return (
    <div className="mb-6 lg:hidden">
      <Collapsible open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
        <div className="flex justify-between items-center mb-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex justify-between items-center bg-white border border-gray-200 shadow-sm hover:border-[#302082]/50 transition-all"
            >
              <span className="flex items-center text-[#302082] font-medium">
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
              </span>
              {isFilterMenuOpen ? (
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
                  className="h-4 w-4"
                >
                  <path d="m18 15-6-6-6 6"></path>
                </svg>
              ) : (
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
                  className="h-4 w-4"
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Card className="border-0 shadow-md mb-4">
            <CardContent className="p-4 bg-white border border-gray-100 rounded-xl">
              <form onSubmit={handlers.handleSearch} className="space-y-4">
                {/* Version mobile des filtres */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title-mobile"
                      className="font-medium text-gray-700"
                    >
                      Titre
                    </Label>
                    <Input
                      id="title-mobile"
                      value={title}
                      onChange={e => handlers.setTitle(e.target.value)}
                      placeholder="Rechercher par titre..."
                      className="border-[#302082]/30 focus:border-[#302082]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description-mobile"
                      className="font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    <Input
                      id="description-mobile"
                      value={description}
                      onChange={e => handlers.setDescription(e.target.value)}
                      placeholder="Rechercher dans les descriptions..."
                      className="border-[#302082]/30 focus:border-[#302082]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="features-mobile"
                    className="font-medium text-gray-700"
                  >
                    Caractéristiques techniques
                  </Label>
                  <Input
                    id="features-mobile"
                    value={features}
                    onChange={e => handlers.setFeatures(e.target.value)}
                    placeholder="Rechercher dans les caractéristiques..."
                    className="border-[#302082]/30 focus:border-[#302082]"
                  />
                </div>

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
                      className="my-4"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="minPrice-mobile"
                        className="text-xs text-gray-500"
                      >
                        Min
                      </Label>
                      <Input
                        id="minPrice-mobile"
                        value={priceInput.min}
                        onChange={e =>
                          handlers.handlePriceInputChange("min", e.target.value)
                        }
                        className="border-[#302082]/30 focus:border-[#302082]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="maxPrice-mobile"
                        className="text-xs text-gray-500"
                      >
                        Max
                      </Label>
                      <Input
                        id="maxPrice-mobile"
                        value={priceInput.max}
                        onChange={e =>
                          handlers.handlePriceInputChange("max", e.target.value)
                        }
                        className="border-[#302082]/30 focus:border-[#302082]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="category-mobile"
                      className="font-medium text-gray-700"
                    >
                      Catégorie
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={handlers.setSelectedCategory}
                    >
                      <SelectTrigger
                        id="category-mobile"
                        className="border-[#302082]/30 focus:border-[#302082]"
                      >
                        <SelectValue placeholder="Toutes les catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          Toutes les catégories
                        </SelectItem>
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

                  <div className="flex items-center space-x-2 self-end h-10">
                    <Checkbox
                      id="onlyAvailable-mobile"
                      checked={onlyAvailable}
                      onCheckedChange={checked =>
                        handlers.setOnlyAvailable(checked as boolean)
                      }
                      className="text-[#302082] border-[#302082]/50"
                    />
                    <Label
                      htmlFor="onlyAvailable-mobile"
                      className="cursor-pointer text-gray-700"
                    >
                      Uniquement services disponibles
                    </Label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlers.resetFilters}
                    className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#302082] hover:bg-[#302082]/90 text-white shadow-sm hover:shadow-md transition-all"
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
                </div>
              </form>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
