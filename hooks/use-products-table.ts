import { useState, useEffect } from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"
import { globalFilterFunction } from "@/components/Admin/Products/ProductColumns"
import { productColumns } from "@/components/Admin/Products/ProductColumns"
import { ProductWithImages } from "@/types/Types"

// Options pour le filtre de stock
export const stockOptions = [
  { value: "all", label: "Tous les stocks" },
  { value: "out", label: "Rupture (0)" },
  { value: "low", label: "Critique (≤ 5)" },
  { value: "medium", label: "Faible (≤ 10)" },
  { value: "high", label: "Bon (> 10)" },
]

// Fonction pour filtrer par stock
export const stockFilterFn: FilterFn<ProductWithImages> = (
  row,
  columnId,
  filterValue
) => {
  if (filterValue === "all") return true

  const stock = row.getValue(columnId) as number

  switch (filterValue) {
    case "out":
      return stock === 0
    case "low":
      return stock <= 5 && stock > 0
    case "medium":
      return stock <= 10 && stock > 5
    case "high":
      return stock > 10
    default:
      return true
  }
}

export function useProductsTable(
  products: ProductWithImages[],
  activeTab: string
) {
  // États pour la table
  const [sorting, setSorting] = useState<SortingState>([
    { id: "priority_order", desc: false },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Initialisation de la table
  const table = useReactTable({
    data: products,
    columns: productColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    filterFns: {
      dateRange: globalFilterFunction as FilterFn<ProductWithImages>,
      stockRange: stockFilterFn,
      global: globalFilterFunction as FilterFn<ProductWithImages>,
    },
    globalFilterFn: globalFilterFunction as FilterFn<ProductWithImages>,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10,
      },
      sorting: [{ id: "priority_order", desc: false }],
      columnVisibility: {
        name: false,
      },
    },
  })

  // Appliquer le filtre en fonction de l'onglet actif
  useEffect(() => {
    if (activeTab === "tous") {
      table.getColumn("available")?.setFilterValue(undefined)
    } else if (activeTab === "disponibles") {
      table.getColumn("available")?.setFilterValue(true)
    } else if (activeTab === "indisponibles") {
      table.getColumn("available")?.setFilterValue(false)
    }
  }, [activeTab, table])

  return {
    table,
    globalFilter,
    setGlobalFilter,
    stockOptions,
  }
}
