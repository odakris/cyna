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
import {
  HeroCarouselColumns,
  globalFilterFunction,
} from "@/components/Admin/HeroCarousel/HeroCarouselColumns"
import { HeroCarouselSlide } from "@prisma/client"

export function useHeroCarouselTable(
  slides: HeroCarouselSlide[],
  activeTab: string
) {
  // States for the table
  const [sorting, setSorting] = useState<SortingState>([
    { id: "priority_order", desc: false },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Initialize the table
  const table = useReactTable({
    data: slides,
    columns: HeroCarouselColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    filterFns: {
      global: globalFilterFunction as FilterFn<HeroCarouselSlide>,
    },
    globalFilterFn: globalFilterFunction as FilterFn<HeroCarouselSlide>,
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
    },
  })

  // Apply filter based on active tab
  useEffect(() => {
    if (activeTab === "tous") {
      table.getColumn("active")?.setFilterValue(undefined)
    } else if (activeTab === "actifs") {
      table.getColumn("active")?.setFilterValue(true)
    } else if (activeTab === "inactifs") {
      table.getColumn("active")?.setFilterValue(false)
    }
  }, [activeTab, table])

  return {
    table,
    globalFilter,
    setGlobalFilter,
  }
}
