import * as React from "react"
import { ColumnDef, Row } from "@tanstack/react-table"
import { ArrowUpDown, BarChart3, Link2, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { HeroCarouselSlide } from "@prisma/client"
import ActionsCell from "@/components/Admin/ActionCell"

export const heroCarouselColumns: ColumnDef<HeroCarouselSlide>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner tout"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "slide",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Slide
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const title = row.getValue("title") as string
      const imageUrl = row.original.image_url

      return (
        <div className="flex items-center space-x-4 pl-2">
          <div className="flex-shrink-0 relative w-24 h-16 border border-border overflow-hidden rounded-md">
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
              <Image
                alt={`Image de ${title || "slide"}`}
                src={imageUrl}
                width={96}
                height={64}
                className="object-cover w-full h-full"
                style={{ aspectRatio: "3/2" }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="font-medium text-left">{title}</div>
            <div className="text-sm text-muted-foreground text-left">
              ID: #{row.original.id_hero_slide}
            </div>
          </div>
        </div>
      )
    },
    accessorFn: row => row.title,
    enableSorting: true,
  },
  {
    accessorKey: "title",
    header: "Titre",
    size: 0,
    enableHiding: true,
  },
  {
    accessorKey: "priority_order",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
          Priorité
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority_order") as number

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    priority <= 3
                      ? "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                      : priority <= 7
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                  )}
                >
                  {priority}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Priorité d&apos;affichage: {priority}
              {priority <= 3 && " (Haute)"}
              {priority > 3 && priority <= 7 && " (Moyenne)"}
              {priority > 7 && " (Basse)"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "button_text",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Link2 className="mr-2 h-4 w-4 text-muted-foreground" />
          Bouton CTA
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const buttonText = row.getValue("button_text") as string | null
      const buttonLink = row.original.button_link

      if (!buttonText) {
        return <div className="text-center text-muted-foreground">-</div>
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <Badge variant="outline" className="bg-slate-100">
                  {buttonText}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{buttonText}</p>
              {buttonLink && (
                <p className="text-xs text-muted-foreground">
                  Lien: {buttonLink}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean

      return (
        <div className="flex justify-center">
          <Switch
            checked={active}
            aria-label={active ? "Désactiver" : "Activer"}
          />
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        actions={[
          { type: "view", tooltip: "Voir les détails" },
          { type: "edit", tooltip: "Modifier le slide" },
          { type: "external", tooltip: "Voir sur le site" },
        ]}
        basePath="/dashboard/hero-carousel"
        entityId={row.original.id_hero_slide}
        externalBasePath="/hero-carousel"
      />
    ),
    enableHiding: false,
  },
]

export const heroCarouselColumnNamesInFrench: Record<string, string> = {
  slide: "Slide",
  priority_order: "Priorité",
  title: "Titre",
  button_text: "Bouton CTA",
  active: "Statut",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher sur plusieurs colonnes
export const globalFilterFunction = (
  row: Row<HeroCarouselSlide>,
  columnId: string,
  filterValue: string
): boolean => {
  const searchTerm = filterValue.toLowerCase()

  // Recherche dans le titre
  if (
    row.getValue("title") &&
    String(row.getValue("title")).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans l'id du slide
  if (
    row.original.id_hero_slide &&
    String(row.original.id_hero_slide).includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans la description (si disponible)
  if (
    row.original.description &&
    String(row.original.description).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans le texte du bouton
  if (
    row.original.button_text &&
    String(row.original.button_text).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  return false
}
