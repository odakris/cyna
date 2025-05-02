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
} from "@tanstack/react-table"
import {
  globalFilterFunction,
  productsFilterFn,
} from "@/components/Admin/Categories/CategoriesColumns"
import { categoriesColumns } from "@/components/Admin/Categories/CategoriesColumns"
import { CategoryWithProduct } from "@/types/Types"

export function useCategoriesTable(
  categories: CategoryWithProduct[],
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
    data: categories,
    columns: categoriesColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    filterFns: {
      global: globalFilterFunction,
      productsFilter: productsFilterFn,
    },
    globalFilterFn: globalFilterFunction,
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
    if (activeTab === "toutes") {
      // Aucun filtre
      table.getColumn("products")?.setFilterValue(undefined)
    } else if (activeTab === "avec-produits") {
      // Filtre pour les catégories avec produits
      table.getColumn("products")?.setFilterValue(true)
    } else if (activeTab === "sans-produits") {
      // Filtre pour les catégories sans produits
      table.getColumn("products")?.setFilterValue(false)
    }
  }, [activeTab, table])

  return {
    table,
    globalFilter,
    setGlobalFilter,
  }
}
