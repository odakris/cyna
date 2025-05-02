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
  ContactMessageColumns,
  globalFilterFunction,
  ContactMessage,
} from "@/components/Admin/ContactMessages/ContactMessageColumns"

export function useContactMessagesTable(
  messages: ContactMessage[],
  activeTab: string
) {
  // États pour la table
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sent_date", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Initialisation de la table
  const table = useReactTable({
    data: messages,
    columns: ContactMessageColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    filterFns: {
      global: globalFilterFunction as FilterFn<ContactMessage>,
    },
    globalFilterFn: globalFilterFunction as FilterFn<ContactMessage>,
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
      sorting: [{ id: "sent_date", desc: true }],
    },
  })

  // Appliquer le filtre en fonction de l'onglet actif
  useEffect(() => {
    if (activeTab === "tous") {
      table.getColumn("is_read")?.setFilterValue("all")
    } else if (activeTab === "non-lus") {
      table.getColumn("is_read")?.setFilterValue("unread")
    } else if (activeTab === "lus") {
      table.getColumn("is_read")?.setFilterValue("read")
    } else if (activeTab === "repondus") {
      table.getColumn("is_read")?.setFilterValue("responded")
    }
  }, [activeTab, table])

  return {
    table,
    globalFilter,
    setGlobalFilter,
  }
}
