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
  ColumnDef,
} from "@tanstack/react-table"
import { MainMessage } from "@prisma/client"
import { globalFilterFunction } from "@/components/Admin/MainMessage/MainMessageColumns"

export function useMainMessagesTable(
  messages: MainMessage[],
  activeTab: string,
  mainMessageColumns: ColumnDef<MainMessage>[],
  toggleMessageActive?: (id: number, newStatus: boolean) => Promise<boolean>
) {
  // États pour la table
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updated_at", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Initialisation de la table
  const table = useReactTable({
    data: messages,
    columns: mainMessageColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    filterFns: {
      global: globalFilterFunction as FilterFn<MainMessage>,
    },
    globalFilterFn: globalFilterFunction as FilterFn<MainMessage>,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    // Passer la fonction toggleMessageActive à travers le meta de la table
    meta: {
      toggleMessageActive,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
      sorting: [{ id: "updated_at", desc: true }],
    },
  })

  // Appliquer le filtre en fonction de l'onglet actif
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
