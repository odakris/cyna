"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  FilterFn,
} from "@tanstack/react-table"

// Extend the FilterFns type to include emailVerifiedFilter
declare module "@tanstack/react-table" {
  interface FilterFns {
    emailVerifiedFilter: FilterFn<User>
  }
}
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Search,
  Columns,
  AlertTriangle,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Users,
  UserPlus,
  Shield,
  Filter,
  CheckCheck,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  usersColumnNamesInFrench,
  usersColumns,
  globalFilterFunction,
} from "./user-columns"
import { User } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function UserHomePage() {
  const [users, setUsers] = useState<User[]>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: "last_name", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeTab, setActiveTab] = useState("tous")

  const roleOptions = [
    { value: "all", label: "Tous les rôles" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Admin" },
    { value: "MANAGER", label: "Manager" },
    { value: "CUSTOMER", label: "Client" },
  ]

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: User[] = await response.json()
      setUsers(data)
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchUsers:", error)
      setError("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Fonction pour filtrer par statut de vérification d'email
  const emailVerifiedFilterFn: FilterFn<User> = (
    row,
    columnId,
    filterValue
  ) => {
    if (filterValue === undefined) return true
    const emailVerified = row.getValue(columnId) as boolean
    return filterValue === emailVerified
  }

  const table = useReactTable<User>({
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      productsFilter: (row, columnId, filterValue) => true, // Placeholder function
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dateRange: (row, columnId, filterValue) => true, // Placeholder function
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      stockRange: (row, columnId, filterValue) => true, // Placeholder function
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

  // Filtrage basé sur l'onglet actif
  useEffect(() => {
    if (activeTab === "tous") {
      table.getColumn("email_verified")?.setFilterValue(undefined)
    } else if (activeTab === "verifies") {
      table.getColumn("email_verified")?.setFilterValue(true)
    } else if (activeTab === "non-verifies") {
      table.getColumn("email_verified")?.setFilterValue(false)
    }
  }, [activeTab, table])

  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_user)

    if (selectedIds.length === 0) return

    try {
      const failedDeletions: number[] = []

      for (const id of selectedIds) {
        const response = await fetch(`/api/users/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          failedDeletions.push(id)
          const errorData = await response.json()
          console.error(
            `Erreur de suppression pour l'utilisateur ${id}:`,
            errorData
          )
        }
      }

      if (failedDeletions.length > 0) {
        setError(
          `Impossible de supprimer ${failedDeletions.length} utilisateur(s). Ils peuvent avoir des commandes associées.`
        )
      }

      setShowDeleteDialog(false)
      setRowSelection({})
      await fetchUsers()
    } catch (error: unknown) {
      console.error("Erreur handleDelete:", error)
      setError("Erreur lors de la suppression des utilisateurs")
    }
  }

  // Statistiques pour les cartes
  const stats = {
    total: users.length,
    verified: users.filter(u => u.email_verified).length,
    unverified: users.filter(u => !u.email_verified).length,
    adminCount: users.filter(
      u => u.role === "ADMIN" || u.role === "SUPER_ADMIN"
    ).length,
  }

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/3" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>

        <Card>
          <CardHeader className="pb-0">
            <Skeleton className="h-7 w-48 mb-2" />
            <Skeleton className="h-5 w-96" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>

            <Skeleton className="h-[500px] w-full rounded-md" />

            <div className="flex justify-between items-center mt-6">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-64" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={fetchUsers} className="w-full sm:w-auto">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">
              Gestion des Utilisateurs
            </h1>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="outline" className="font-normal">
              {users.length} utilisateur{users.length > 1 ? "s" : ""}
            </Badge>
            <Badge
              variant="secondary"
              className="font-normal"
              title="Sélectionnés"
            >
              {table.getFilteredSelectedRowModel().rows.length} sélectionné
              {table.getFilteredSelectedRowModel().rows.length > 1 ? "s" : ""}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="default">
                  <Link href="/dashboard/users/new">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Ajouter un utilisateur
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Créer un nouvel utilisateur</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={Object.keys(rowSelection).length === 0}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer ({Object.keys(rowSelection).length})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogDescription>
                  Vous êtes sur le point de supprimer{" "}
                  <Badge variant="outline" className="font-semibold mx-1">
                    {Object.keys(rowSelection).length}
                  </Badge>
                  utilisateur{Object.keys(rowSelection).length > 1 ? "s" : ""}.
                  Cette action ne peut pas être annulée.
                </DialogDescription>
              </DialogHeader>
              <Alert variant="destructive" className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Si des commandes sont associées à ces utilisateurs, la
                  suppression échouera.
                </AlertDescription>
              </Alert>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirmer la suppression
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" onClick={fetchUsers}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualiser
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">
                    Actualiser les données
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Recharge les données des utilisateurs depuis la base de
                    données.
                  </p>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Utilisateurs
              </p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-primary opacity-80" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Emails Vérifiés
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.verified}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Emails Non Vérifiés
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {stats.unverified}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Administrateurs
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.adminCount}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full mt-3"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="tous" className="flex-1 sm:flex-initial">
                Tous
                <Badge variant="secondary" className="ml-2">
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="verifies" className="flex-1 sm:flex-initial">
                Vérifiés
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-800"
                >
                  {stats.verified}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="non-verifies"
                className="flex-1 sm:flex-initial"
              >
                Non vérifiés
                <Badge
                  variant="secondary"
                  className="ml-2 bg-amber-100 text-amber-800"
                >
                  {stats.unverified}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent className="p-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 ml-auto"
                onClick={() => setError(null)}
              >
                Fermer
              </Button>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, prénom, email..."
                  value={globalFilter ?? ""}
                  onChange={event => setGlobalFilter(event.target.value)}
                  className="pl-8 w-full"
                />
              </div>

              <Select
                value={
                  (table.getColumn("role")?.getFilterValue() as string) ?? "all"
                }
                onValueChange={value => {
                  table
                    .getColumn("role")
                    ?.setFilterValue(value === "all" ? undefined : value)
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rôles</SelectLabel>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fetchUsers()}
                title="Actualiser les données"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    <Columns className="mr-2 h-4 w-4" />
                    Colonnes
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {table
                    .getAllColumns()
                    .filter(column => column.getCanHide())
                    .map(column => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          checked={column.getIsVisible()}
                          onCheckedChange={value =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {usersColumnNamesInFrench[column.id] || column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      return (
                        <TableHead
                          key={header.id}
                          className="text-center px-3 font-semibold"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`group transition-colors ${row.getIsSelected() ? "bg-primary/5" : "hover:bg-muted/50"}`}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id} className="text-center px-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={
                        Object.keys(table.getVisibleLeafColumns()).length
                      }
                      className="h-24 text-center"
                    >
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Filter className="h-8 w-8 mb-2 opacity-50" />
                        <p>Aucun utilisateur trouvé.</p>
                        <p className="text-sm">
                          Essayez de modifier vos filtres.
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="mt-2"
                        >
                          <Link href="/dashboard/users/new">
                            Créer un utilisateur
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 py-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">
                {table.getFilteredSelectedRowModel().rows.length}
              </span>{" "}
              sur{" "}
              <span className="font-medium">
                {table.getFilteredRowModel().rows.length}
              </span>{" "}
              utilisateur(s) sélectionné(s)
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Par page</p>
                <Select
                  value={table.getState().pagination.pageSize.toString()}
                  onValueChange={value => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 30, 40, 50].map(pageSize => (
                      <SelectItem key={pageSize} value={pageSize.toString()}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} sur{" "}
                {table.getPageCount() || 1}
              </div>

              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <span className="sr-only">Première page</span>
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Première page</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        <span className="sr-only">Page précédente</span>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Page précédente</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        <span className="sr-only">Page suivante</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Page suivante</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() =>
                          table.setPageIndex(table.getPageCount() - 1)
                        }
                        disabled={!table.getCanNextPage()}
                      >
                        <span className="sr-only">Dernière page</span>
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Dernière page</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Total des utilisateurs: <strong>{stats.total}</strong> | Vérifiés:{" "}
            <strong className="text-green-600">{stats.verified}</strong> |
            Administrateurs:{" "}
            <strong className="text-blue-600">{stats.adminCount}</strong>
          </p>
          <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Actualiser
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
