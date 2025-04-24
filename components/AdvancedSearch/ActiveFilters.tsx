"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { formatEuro } from "@/lib/utils/format"
import { ActiveFiltersProps } from "@/types/Types"

export function ActiveFilters({
  activeFilters,
  categories,
  removeFilter,
  resetFilters,
  hasActiveFilters,
}: ActiveFiltersProps) {
  if (!hasActiveFilters()) return null

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {activeFilters.title && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-gray-100"
        >
          Titre: {activeFilters.title}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
            onClick={() => removeFilter("title")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {activeFilters.description && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-gray-100"
        >
          Description: {activeFilters.description}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
            onClick={() => removeFilter("description")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {activeFilters.features && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-gray-100"
        >
          Caractéristiques: {activeFilters.features}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
            onClick={() => removeFilter("features")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {activeFilters.minPrice && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-gray-100"
        >
          Prix min: {formatEuro(activeFilters.minPrice)}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
            onClick={() => removeFilter("minPrice")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {activeFilters.maxPrice && activeFilters.maxPrice < 10000 && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-gray-100"
        >
          Prix max: {formatEuro(activeFilters.maxPrice)}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
            onClick={() => removeFilter("maxPrice")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {activeFilters.category && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-gray-100"
        >
          Catégorie:{" "}
          {
            categories.find(
              c => c.id_category.toString() === activeFilters.category
            )?.name
          }
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
            onClick={() => removeFilter("category")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {activeFilters.onlyAvailable && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-gray-100"
        >
          Uniquement disponibles
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 rounded-full"
            onClick={() => removeFilter("onlyAvailable")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {hasActiveFilters() && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-red-500"
          onClick={resetFilters}
        >
          Effacer tous les filtres
        </Button>
      )}
    </div>
  )
}
