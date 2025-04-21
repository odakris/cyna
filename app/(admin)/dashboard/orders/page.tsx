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
  ColumnDef,
} from "@tanstack/react-table"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Search,
  Columns,
  AlertTriangle,
  ChevronsLeft,
  ChevronsRight,
  RefreshCw,
  Filter,
  Clock,
  ReceiptText,
  TruckIcon,
  BanknoteIcon,
  ShoppingCartIcon,
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
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
import {
  ordersColumnNamesInFrench,
  orderColumns,
  globalFilterFunction,
} from "./orders-columns"
import { OrderWithItems } from "@/types/Types"
import { OrderStatus, Role } from "@prisma/client"
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { subDays, isToday } from "date-fns"
import PermissionGuard from "@/components/Auth/PermissionGuard"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { OrdersHomeSkeleton } from "@/components/Skeletons/OrderSkeletons"

export default function OrderHomePage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: "order_date", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const dateOptions = [
    { value: "all", label: "Toutes les dates" },
    { value: "today", label: "Aujourd'hui" },
    { value: "week", label: "Cette semaine" },
    { value: "month", label: "Ce mois" },
  ]

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setOrders(data.orders || [])
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchOrders:", error)
      setError("Erreur lors du chargement des commandes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Fonction pour filtrer par date
  const dateFilterFn: FilterFn<{ order_date: string }> = (
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

  const table = useReactTable({
    data: orders,
    columns: orderColumns as ColumnDef<unknown, unknown>[],
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
      stockRange: (row, columnId, filterValue) => {
        if (!filterValue) return true
        const stock = row.getValue(columnId)
        return (
          typeof stock === "number" &&
          stock >= filterValue.min &&
          stock <= filterValue.max
        )
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      productsFilter: (row, columnId, filterValue) => true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      global: (row, columnId, filterValue) => true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emailVerifiedFilter: (row, columnId, filterValue) => true,
    },
    globalFilterFn: globalFilterFunction as FilterFn<unknown>,
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

  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => (row.original as OrderWithItems).id_order)

    if (selectedIds.length === 0) return

    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/orders/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })
        if (!response.ok) {
          throw new Error(`Error deleting order ${id}`)
        }
      }
      setShowDeleteDialog(false)
      setRowSelection({})
      await fetchOrders()
    } catch (error: unknown) {
      console.error("Erreur handleDelete:", error)
      setError("Erreur lors de la suppression des commandes")
    }
  }

  // Calculer les statistiques
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === OrderStatus.PENDING).length,
    processing: orders.filter(o => o.order_status === OrderStatus.PROCESSING)
      .length,
    active: orders.filter(o => o.order_status === OrderStatus.ACTIVE).length,
    completed: orders.filter(o => o.order_status === OrderStatus.COMPLETED)
      .length,
    cancelled: orders.filter(o => o.order_status === OrderStatus.CANCELLED)
      .length,
    refunded: orders.filter(o => o.order_status === OrderStatus.REFUNDED)
      .length,
    today: orders.filter(o => isToday(new Date(o.order_date))).length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
  }

  if (loading) {
    return <OrdersHomeSkeleton />
  }

  if (error) {
    return (
      <Card className="mx-auto mt-8 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Erreur</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={fetchOrders}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer un message." />
      }
    >
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCartIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Gestion des Commandes
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {orders.length} commande{orders.length > 1 ? "s" : ""}
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
            <PermissionGuard permission="orders:create">
              <Button asChild>
                <Link href="/dashboard/orders/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une commande
                </Link>
              </Button>
            </PermissionGuard>

            <PermissionGuard permission="orders:delete">
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={Object.keys(rowSelection).length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer ({Object.keys(rowSelection).length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmer la suppression</DialogTitle>
                    <DialogDescription>
                      Vous êtes sur le point de supprimer{" "}
                      {Object.keys(rowSelection).length} commande
                      {Object.keys(rowSelection).length > 1 ? "s" : ""}. Cette
                      action ne peut pas être annulée.
                    </DialogDescription>
                  </DialogHeader>
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
            </PermissionGuard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" onClick={() => fetchOrders()}>
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
                      Recharge les données des commandes depuis la base de
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
                  Total Commandes
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <ReceiptText className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  En attente
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Terminées
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.completed}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TruckIcon className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Chiffre d&apos;affaires
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {new Intl.NumberFormat("fr-FR", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(stats.totalRevenue)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <BanknoteIcon className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                  Toutes
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value={OrderStatus.PENDING}
                  className="flex-1 sm:flex-initial"
                >
                  En attente
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-yellow-100 text-yellow-800"
                  >
                    {stats.pending}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value={OrderStatus.PROCESSING}
                  className="flex-1 sm:flex-initial"
                >
                  En cours
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-800"
                  >
                    {stats.processing}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value={OrderStatus.COMPLETED}
                  className="flex-1 sm:flex-initial"
                >
                  Terminé
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.completed}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par n°, client..."
                    value={globalFilter ?? ""}
                    onChange={event => setGlobalFilter(event.target.value)}
                    className="pl-8 w-full"
                  />
                </div>

                <Select
                  value={
                    (table
                      .getColumn("order_date")
                      ?.getFilterValue() as string) ?? "all"
                  }
                  onValueChange={value => {
                    table
                      .getColumn("order_date")
                      ?.setFilterValue(value === "all" ? undefined : value)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Filtrer par date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Période</SelectLabel>
                      {dateOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchOrders()}
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
                            {ordersColumnNamesInFrench[column.id] || column.id}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => {
                        return (
                          <TableHead
                            key={header.id}
                            className="text-center px-3"
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
                          <p>Aucune commande trouvée.</p>
                          <p className="text-sm">
                            Essayez de modifier vos filtres.
                          </p>
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
                commande(s) sélectionnée(s).
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Commandes par page</p>
                  <select
                    className="h-8 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
                    value={table.getState().pagination.pageSize}
                    onChange={e => {
                      table.setPageSize(Number(e.target.value))
                    }}
                  >
                    {[5, 10, 20, 30, 40, 50].map(pageSize => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page {table.getState().pagination.pageIndex + 1} sur{" "}
                  {table.getPageCount()}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Première page</span>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    <span className="sr-only">Page précédente</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Page suivante</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                  >
                    <span className="sr-only">Dernière page</span>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 py-3 border-t flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Total des commandes: <strong>{stats.total}</strong> | En attente:{" "}
              <strong className="text-yellow-600">{stats.pending}</strong> |
              Aujourd&apos;hui:{" "}
              <strong className="text-blue-600">{stats.today}</strong> | CA:{" "}
              <strong className="text-green-600">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(stats.totalRevenue)}
              </strong>
            </p>
            <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Actualiser
            </Button>
          </CardFooter>
        </Card>
      </div>
    </RoleGuard>
  )
}
