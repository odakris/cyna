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
import { globalFilterFunction } from "@/components/Admin/Orders/OrdersColumns"
import { OrderColumns } from "@/components/Admin/Orders/OrdersColumns"
import { OrderWithItems } from "@/types/Types"
import { isToday } from "date-fns/isToday"
import { subDays } from "date-fns/subDays"

// Options pour le filtre de date
export const dateOptions = [
  { value: "all", label: "Toutes les dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
]

// Fonction pour filtrer par date
export const dateFilterFn: FilterFn<OrderWithItems> = (
  row,
  columnId,
  filterValue
) => {
  if (filterValue === "all") return true

  const orderDate = new Date(row.getValue(columnId))
  const today = new Date()

  switch (filterValue) {
    case "today":
      return isToday(orderDate)
    case "week":
      return orderDate >= subDays(today, 7)
    case "month":
      return orderDate >= new Date(today.getFullYear(), today.getMonth(), 1)
    default:
      return true
  }
}

export function useOrdersTable(orders: OrderWithItems[], activeTab: string) {
  // États pour la table
  const [sorting, setSorting] = useState<SortingState>([
    { id: "order_date", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Initialisation de la table
  const table = useReactTable({
    data: orders,
    columns: OrderColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    filterFns: {
      dateRange: dateFilterFn,
      global: globalFilterFunction,
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
      sorting: [{ id: "order_date", desc: true }],
    },
  })

  // Appliquer le filtre en fonction de l'onglet actif
  useEffect(() => {
    if (activeTab === "all") {
      table.getColumn("order_status")?.setFilterValue(undefined)
    } else {
      table.getColumn("order_status")?.setFilterValue(activeTab)
    }
  }, [activeTab, table])

  return {
    table,
    globalFilter,
    setGlobalFilter,
    dateOptions,
  }
}
