import * as React from "react"
import { ColumnDef, FilterFn, Row } from "@tanstack/react-table"
import {
  ArrowUpDown,
  Eye,
  Layers,
  Tag,
  BarChart3,
  Package,
  Check,
  X,
  ExternalLink,
  PencilLine,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ProductWithImages } from "@/types/Types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const productsFilterFn: FilterFn<ProductWithImages> = (
  row,
  columnId,
  filterValue
) => {
  if (filterValue === undefined || filterValue === "all") return true

  const stock = row.getValue(columnId) as number

  switch (filterValue) {
    case "out":
      return stock === 0
    case "low":
      return stock < 5
    case "medium":
      return stock <= 10
    case "high":
      return stock > 10
    default:
      return true
  }
}

export const productColumns: ColumnDef<ProductWithImages>[] = [
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
    id: "product",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Produit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      const imageUrl = row.original.main_image

      return (
        <div className="flex items-center space-x-4 pl-2">
          <div className="flex-shrink-0 relative w-16 h-16 border border-border overflow-hidden rounded-md">
            <div className="absolute inset-0 bg-slate-50 flex items-center justify-center">
              <Image
                alt={`Image de ${name || "produit"}`}
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
              Réf: #{row.original.id_product}
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
    accessorKey: "unit_price",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
          Prix unitaire
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("unit_price"))
      // Formatter le prix avec séparateur de milliers et 2 décimales
      const formattedPrice = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(price)

      return (
        <div className="text-center font-semibold">
          <span
            className={cn(
              price > 100
                ? "text-violet-600"
                : price > 50
                  ? "text-blue-600"
                  : "text-green-600"
            )}
          >
            {formattedPrice}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "stock",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const stock = parseInt(row.getValue("stock"))
      let badgeClass = ""
      let stockStatus = ""

      if (stock === 0) {
        badgeClass = "bg-red-100 text-red-800 border-red-300"
        stockStatus = "Rupture"
      } else if (stock <= 5) {
        badgeClass = "bg-amber-100 text-amber-800 border-amber-300"
        stockStatus = "Critique"
      } else if (stock <= 10) {
        badgeClass = "bg-yellow-100 text-yellow-800 border-yellow-300"
        stockStatus = "Faible"
      } else {
        badgeClass = "bg-green-100 text-green-800 border-green-300"
        stockStatus = "Bon"
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <Badge
                  variant="outline"
                  className={`font-medium ${badgeClass}`}
                >
                  {stock}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-semibold">{stockStatus}</div>
                <div className="text-xs">{stock} unités en stock</div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
    filterFn: productsFilterFn,
  },
  {
    accessorKey: "available",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const available = row.getValue("available") as boolean
      return (
        <div className="text-center">
          {available ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0">
              <Check className="mr-1 h-3 w-3" /> Disponible
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-slate-100 text-slate-800 border-slate-200"
            >
              <X className="mr-1 h-3 w-3" /> Indisponible
            </Badge>
          )}
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/dashboard/products/${row.original.id_product}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Voir</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Voir les détails</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/dashboard/products/${row.original.id_product}/edit`}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <PencilLine className="h-4 w-4" />
                  <span className="sr-only">Modifier</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Modifier le produit</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/produit/${row.original.id_product}`}
                target={"_blank"}
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">Voir sur le site</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Voir sur le site</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    enableHiding: false,
  },
]

export const productsColumnNamesInFrench: Record<string, string> = {
  product: "Produit",
  priority_order: "Priorité",
  name: "Nom",
  unit_price: "Prix unitaire",
  stock: "Stock",
  available: "Statut",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher sur plusieurs colonnes
export const globalFilterFunction = (
  row: Row<ProductWithImages>,
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

  // Recherche dans l'id du produit
  if (
    row.original.id_product &&
    String(row.original.id_product).includes(searchTerm)
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

  return false
}
