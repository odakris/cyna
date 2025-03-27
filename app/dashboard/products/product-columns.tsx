import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ProductWithImages } from "@/types/Types"

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
    accessorKey: "priority_order",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Priorité
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("priority_order")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="relative h-16 w-16 overflow-hidden rounded-md border">
          <Image
            alt={`Image de ${row.getValue("name") || "produit"}`}
            src={`${row.original.main_image}`}
            width={70}
            height={70}
            className="h-full w-full object-cover transition-transform hover:scale-110"
          />
        </div>
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Nom du produit
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
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
          Prix unitaire
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-primary">
        {parseFloat(row.getValue("unit_price")).toFixed(2)} €
      </div>
    ),
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
          Stock
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const stock = parseInt(row.getValue("stock"))
      return (
        <div className="text-center">
          <Badge
            variant={
              stock > 10 ? "default" : stock > 5 ? "outline" : "destructive"
            }
            className="font-medium"
          >
            {stock} unités
          </Badge>
        </div>
      )
    },
    enableSorting: true,
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
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const available = row.getValue("available")
      return (
        <div className="text-center">
          <Badge
            variant={available ? "default" : "destructive"}
            className={available ? "bg-green-500 hover:bg-green-600" : ""}
          >
            {available ? "Disponible" : "Indisponible"}
          </Badge>
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
        <Link href={`/dashboard/products/${row.original.id_product}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Voir</span>
          </Button>
        </Link>
        <Link href={`/dashboard/products/${row.original.id_product}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier</span>
          </Button>
        </Link>
      </div>
    ),
    enableHiding: false,
  },
]

export const productsColumnNamesInFrench: Record<string, string> = {
  priority_order: "Priorité",
  image: "Image",
  name: "Nom",
  unit_price: "Prix unitaire",
  stock: "Stock",
  available: "Statut",
  actions: "Actions",
}
