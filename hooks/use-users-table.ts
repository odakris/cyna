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
  usersColumns,
  globalFilterFunction,
  roleFilterFn,
  emailVerifiedFilterFn,
} from "@/components/Admin/Users/UsersColumns"
import { User } from "@prisma/client"

// Options pour le filtre par rôle
export const roleOptions = [
  {
    value: "all",
    label: "Tous les rôles",
    color: "bg-gray-100 text-gray-800",
    description: "Tous les utilisateurs",
  },
  {
    value: "SUPER_ADMIN",
    label: "Super Admin",
    color: "bg-purple-100 text-purple-800",
    description: "Contrôle total du système",
  },
  {
    value: "ADMIN",
    label: "Admin",
    color: "bg-red-100 text-red-800",
    description: "Accès complet à l'administration",
  },
  {
    value: "MANAGER",
    label: "Manager",
    color: "bg-blue-100 text-blue-800",
    description: "Gestion des contenus et des clients",
  },
  {
    value: "CUSTOMER",
    label: "Client",
    color: "bg-green-100 text-green-800",
    description: "Accès limité aux fonctionnalités de base",
  },
]

export function useUsersTable(users: User[], activeTab: string) {
  // États pour la table
  const [sorting, setSorting] = useState<SortingState>([
    { id: "last_name", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Initialisation de la table
  const table = useReactTable({
    data: users,
    columns: usersColumns,
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
      emailVerifiedFilter: emailVerifiedFilterFn,
      roleFilter: roleFilterFn,
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
      sorting: [{ id: "last_name", desc: true }],
    },
  })

  // Appliquer le filtre en fonction de l'onglet actif
  useEffect(() => {
    if (activeTab === "tous") {
      table.getColumn("email_verified")?.setFilterValue(undefined)
    } else if (activeTab === "verifies") {
      table.getColumn("email_verified")?.setFilterValue(true)
    } else if (activeTab === "non-verifies") {
      table.getColumn("email_verified")?.setFilterValue(false)
    }
  }, [activeTab, table])

  return {
    table,
    globalFilter,
    setGlobalFilter,
    roleOptions,
  }
}
