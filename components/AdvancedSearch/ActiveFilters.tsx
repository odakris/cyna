"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    <div className="flex flex-wrap gap-2 mb-6 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
      {activeFilters.title && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-[#302082]/5 text-[#302082] border-[#302082]/20 px-3 py-1.5 rounded-full"
        >
          Titre: {activeFilters.title}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-[#302082]/10"
            onClick={() => removeFilter("title")}
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
              className="h-3 w-3"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </Badge>
      )}

      {activeFilters.description && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-[#302082]/5 text-[#302082] border-[#302082]/20 px-3 py-1.5 rounded-full"
        >
          Description: {activeFilters.description}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-[#302082]/10"
            onClick={() => removeFilter("description")}
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
              className="h-3 w-3"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </Badge>
      )}

      {activeFilters.features && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-[#302082]/5 text-[#302082] border-[#302082]/20 px-3 py-1.5 rounded-full"
        >
          Caractéristiques: {activeFilters.features}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-[#302082]/10"
            onClick={() => removeFilter("features")}
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
              className="h-3 w-3"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </Badge>
      )}

      {activeFilters.minPrice && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-[#302082]/5 text-[#302082] border-[#302082]/20 px-3 py-1.5 rounded-full"
        >
          Prix min: {formatEuro(activeFilters.minPrice)}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-[#302082]/10"
            onClick={() => removeFilter("minPrice")}
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
              className="h-3 w-3"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </Badge>
      )}

      {activeFilters.maxPrice && activeFilters.maxPrice < 10000 && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-[#302082]/5 text-[#302082] border-[#302082]/20 px-3 py-1.5 rounded-full"
        >
          Prix max: {formatEuro(activeFilters.maxPrice)}
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-[#302082]/10"
            onClick={() => removeFilter("maxPrice")}
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
              className="h-3 w-3"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </Badge>
      )}

      {activeFilters.category && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-[#302082]/5 text-[#302082] border-[#302082]/20 px-3 py-1.5 rounded-full"
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
            className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-[#302082]/10"
            onClick={() => removeFilter("category")}
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
              className="h-3 w-3"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </Badge>
      )}

      {activeFilters.onlyAvailable && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 bg-[#302082]/5 text-[#302082] border-[#302082]/20 px-3 py-1.5 rounded-full"
        >
          Uniquement disponibles
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 ml-1 rounded-full hover:bg-[#302082]/10"
            onClick={() => removeFilter("onlyAvailable")}
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
              className="h-3 w-3"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </Badge>
      )}

      {hasActiveFilters() && (
        <Button
          variant="ghost"
          size="sm"
          className="text-[#FF6B00] hover:text-[#FF6B00]/80 hover:bg-[#FF6B00]/5 font-medium transition-colors ml-1"
          onClick={resetFilters}
        >
          Effacer tous les filtres
        </Button>
      )}
    </div>
  )
}
