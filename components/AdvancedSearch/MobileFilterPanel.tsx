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
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react"
import { formatEuro } from "@/lib/utils/format"
import { MobileFilterPanelProps } from "@/types/Types"

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
    <div className="mb-4 lg:hidden">
      <Collapsible open={isFilterMenuOpen} onOpenChange={setIsFilterMenuOpen}>
        <div className="flex justify-between items-center mb-2">
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full flex justify-between items-center"
            >
              <span className="flex items-center">
                <SlidersHorizontal className="mr-2 h-5 w-5" /> Filtres
              </span>
              {isFilterMenuOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handlers.handleSearch} className="space-y-4">
                {/* Version mobile des filtres */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title-mobile">Titre</Label>
                    <Input
                      id="title-mobile"
                      value={title}
                      onChange={e => handlers.setTitle(e.target.value)}
                      placeholder="Rechercher par titre..."
                      className="border-[#302082]/30 focus:border-[#302082]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description-mobile">Description</Label>
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
                  <Label htmlFor="features-mobile">
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
                  <Label>
                    Prix: {formatEuro(priceRange[0])} -{" "}
                    {formatEuro(priceRange[1])}
                  </Label>
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
                      <Label htmlFor="minPrice-mobile" className="text-xs">
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
                      <Label htmlFor="maxPrice-mobile" className="text-xs">
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
                    <Label htmlFor="category-mobile">Catégorie</Label>
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
                    />
                    <Label
                      htmlFor="onlyAvailable-mobile"
                      className="cursor-pointer"
                    >
                      Uniquement services disponibles
                    </Label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handlers.resetFilters}
                    className="text-gray-500"
                  >
                    Réinitialiser
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#302082] hover:bg-[#302082]/90"
                  >
                    <Search className="mr-2 h-4 w-4" /> Rechercher
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
