import * as React from "react"
import { ColumnDef, Row, FilterFn } from "@tanstack/react-table"
import {
  ArrowUpDown,
  Eye,
  Edit,
  Layers,
  Tag,
  BarChart3,
  Package,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Category } from "@prisma/client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CategoryWithProduct } from "@/types/Types"

// Fonction de filtrage personnalisée pour les produits
export const productsFilterFn: FilterFn<CategoryWithProduct> = (
  row,
  columnId,
  filterValue
) => {
  if (filterValue === undefined) return true

  const productsCount = row.original.products?.length || 0

  if (filterValue === true) {
    // Filtre pour catégories avec produits
    return productsCount > 0
  } else if (filterValue === false) {
    // Filtre pour catégories sans produits
    return productsCount === 0
  }

  return true
}

export const categoriesColumns: ColumnDef<CategoryWithProduct>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner tout"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "category",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
          Catégorie
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const imageUrl = row.original.image

      return (
        <div className="flex items-center space-x-4 pl-2">
          <div className="flex-shrink-0 relative w-16 h-16 border border-border overflow-hidden rounded-md">
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
              <Image
                alt={`Image de ${name || "catégorie"}`}
                src={imageUrl}
                width={64}
                height={64}
                className="object-contain w-full h-full"
                style={{ aspectRatio: "1/1" }}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="font-medium text-left">{name}</div>
            <div className="text-sm text-muted-foreground text-left">
              ID: #{row.original.id_category}
            </div>
          </div>
        </div>
      )
    },
    accessorFn: row => row.name,
    enableSorting: true,
  },
  {
    accessorKey: "name",
    header: "Nom",
    size: 0,
    enableHiding: true,
    meta: {
      hidden: true,
    },
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
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                      : priority <= 7
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
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
    filterFn: (row, id, value) => {
      if (value === "all") return true

      const priority = row.getValue(id) as number

      switch (value) {
        case "high":
          return priority <= 3
        case "medium":
          return priority > 3 && priority <= 7
        case "low":
          return priority > 7
        default:
          return true
      }
    },
  },
  {
    accessorKey: "products",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
          Produits
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const productsCount = row.original.products?.length || 0
      return (
        <div className="text-center">
          <Badge
            variant={productsCount > 0 ? "outline" : "secondary"}
            className={cn(
              "font-medium",
              productsCount > 0
                ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
            )}
          >
            {productsCount} produit{productsCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
    accessorFn: row => row.products?.length || 0,
    filterFn: productsFilterFn,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
          Description
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const description = row.original.description || ""

      return (
        <div className="max-w-xs text-left truncate" title={description}>
          {description.length > 50
            ? description.substring(0, 50) + "..."
            : description || (
                <span className="text-muted-foreground italic">
                  Non définie
                </span>
              )}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link
                  href={`/dashboard/categories/${row.original.id_category}`}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Voir</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voir les détails</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link
                  href={`/dashboard/categories/${row.original.id_category}/edit`}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Modifier</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Modifier la catégorie</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link
                  href={`/categorie/${row.original.id_category}`}
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Voir sur le site</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voir sur le site</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    enableHiding: false,
  },
]

export const categoriesColumnNamesInFrench: Record<string, string> = {
  category: "Catégorie",
  priority_order: "Priorité",
  image: "Image",
  name: "Nom",
  description: "Description",
  products: "Produits",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher sur plusieurs colonnes
export const globalFilterFunction = (
  row: Row<Category>,
  columnId: string,
  filterValue: string
): boolean => {
  const searchTerm = filterValue.toLowerCase()

  // Recherche dans le nom
  if (
    row.getValue("name") &&
    String(row.getValue("name")).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans l'id de la catégorie
  if (
    row.original.id_category &&
    String(row.original.id_category).includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans la description
  if (
    row.original.description &&
    String(row.original.description).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  return false
}
