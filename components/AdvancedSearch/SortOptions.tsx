"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SortOptionsProps } from "@/types/Types"

export function SortOptions({
  sortOptions,
  updateSort,
  productsCount,
}: SortOptionsProps) {
  return (
    <div className="flex flex-wrap justify-between items-center mb-6 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
        {productsCount} service{productsCount !== 1 ? "s" : ""} trouvé
        {productsCount !== 1 ? "s" : ""}
      </h2>

      <div className="flex flex-wrap gap-2">
        {/* Tri par prix */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border border-gray-200 bg-white hover:border-[#302082]/50 transition-colors"
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
                className="h-4 w-4 mr-1"
              >
                <path d="M3 9h18"></path>
                <path d="M8 4v6"></path>
                <path d="M3 15h18"></path>
                <path d="M16 20v-6"></path>
              </svg>
              Prix: {sortOptions.price === "asc" ? "Croissant" : "Décroissant"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Trier par prix</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortOptions.price}
              onValueChange={value => updateSort("price", value)}
            >
              <DropdownMenuRadioItem value="asc" className="cursor-pointer">
                Croissant
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc" className="cursor-pointer">
                Décroissant
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tri par nouveauté */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border border-gray-200 bg-white hover:border-[#302082]/50 transition-colors"
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
                className="h-4 w-4 mr-1"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
                <path d="M8 14h.01"></path>
                <path d="M12 14h.01"></path>
                <path d="M16 14h.01"></path>
                <path d="M8 18h.01"></path>
                <path d="M12 18h.01"></path>
                <path d="M16 18h.01"></path>
              </svg>
              {sortOptions.newness === "new" ? "Plus récents" : "Plus anciens"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Trier par date</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortOptions.newness}
              onValueChange={value => updateSort("newness", value)}
            >
              <DropdownMenuRadioItem value="new" className="cursor-pointer">
                Plus récents
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="old" className="cursor-pointer">
                Plus anciens
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tri par disponibilité */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 border border-gray-200 bg-white hover:border-[#302082]/50 transition-colors"
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
                className="h-4 w-4 mr-1"
              >
                <path d="M5 8h14"></path>
                <path d="M5 12h14"></path>
                <path d="M5 16h14"></path>
                <path d="M3 21h18"></path>
                <path d="M3 3h18"></path>
              </svg>
              {sortOptions.availability === "available"
                ? "Disponibles d'abord"
                : "Non disponibles d'abord"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Trier par disponibilité</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortOptions.availability}
              onValueChange={value => updateSort("availability", value)}
            >
              <DropdownMenuRadioItem
                value="available"
                className="cursor-pointer"
              >
                Disponibles d&apos;abord
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="unavailable"
                className="cursor-pointer"
              >
                Non disponibles d&apos;abord
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
