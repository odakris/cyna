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
import { ArrowDownAZ, Calendar, Package2 } from "lucide-react"
import { SortOptionsProps } from "@/types/Types"

export function SortOptions({
  sortOptions,
  updateSort,
  productsCount,
}: SortOptionsProps) {
  return (
    <div className="flex flex-wrap justify-between items-center mt-6 mb-4">
      <h2 className="text-xl font-semibold mb-2">
        {productsCount} service{productsCount !== 1 ? "s" : ""} trouvé
        {productsCount !== 1 ? "s" : ""}
      </h2>
      <div className="flex flex-wrap gap-2">
        {/* Tri par prix */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <ArrowDownAZ className="mr-2 h-4 w-4" />
              Prix {sortOptions.price === "asc" ? "croissant" : "décroissant"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Trier par prix</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortOptions.price}
              onValueChange={value => updateSort("price", value)}
            >
              <DropdownMenuRadioItem value="asc">
                Croissant
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="desc">
                Décroissant
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tri par nouveauté */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
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
              <DropdownMenuRadioItem value="new">
                Plus récents
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="old">
                Plus anciens
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Tri par disponibilité */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <Package2 className="mr-2 h-4 w-4" />
              {sortOptions.availability === "available"
                ? "Disponibles"
                : "Non disponibles"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Trier par disponibilité</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={sortOptions.availability}
              onValueChange={value => updateSort("availability", value)}
            >
              <DropdownMenuRadioItem value="available">
                Disponibles d&apos;abord
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="unavailable">
                Non disponibles d&apos;abord
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
