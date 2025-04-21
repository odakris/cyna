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
  Package,
  RefreshCw,
  Sparkles,
  Filter,
  ShoppingBagIcon,
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
import { ProductWithImages } from "@/types/Types"
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
  productsColumnNamesInFrench,
  productColumns,
  globalFilterFunction,
  productsFilterFn,
} from "./product-columns"
import PermissionGuard from "@/components/Auth/PermissionGuard"
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
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { ProductsHomeSkeleton } from "@/components/Skeletons/ProductSkeletons"

declare module "@tanstack/react-table" {
  interface FilterFns {
    stockRange: FilterFn<ProductWithImages>
  }
}

export default function ProductHomePage() {
  const [products, setProducts] = useState<ProductWithImages[]>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: "priority_order", desc: false },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeTab, setActiveTab] = useState("tous")

  const stockOptions = [
    { value: "all", label: "Tous les stocks" },
    { value: "out", label: "Rupture (0)" },
    { value: "low", label: "Critique (≤ 5)" },
    { value: "medium", label: "Faible (≤ 10)" },
    { value: "high", label: "Bon (> 10)" },
  ]

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: ProductWithImages[] = await response.json()
      console.log("data fetchProducts:", data)
      setProducts(data)
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchProducts:", error)
      setError("Erreur lors du chargement des produits")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Fonction pour filtrer par stock
  const stockFilterFn: FilterFn<ProductWithImages> = (
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
      productsFilter: productsFilterFn,
      global: globalFilterFunction as FilterFn<ProductWithImages>,
      emailVerifiedFilter: (row, columnId, filterValue) => {
        const emailVerified = row.getValue(columnId) as boolean
        return filterValue === undefined || emailVerified === filterValue
      },
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

  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_product)

    console.log("selectedIds handleDelete:", selectedIds)
    if (selectedIds.length === 0) return

    try {
      for (const id of selectedIds) {
        console.log("id handleDelete :", id)
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })
        if (!response.ok) {
          throw new Error(`Error deleting product ${id}`)
        }
      }
      setShowDeleteDialog(false)
      setRowSelection({})
      await fetchProducts()
    } catch (error: unknown) {
      console.error("Erreur handleDelete:", error)
      setError("Erreur lors de la suppression des produits")
    }
  }

  const stats = {
    total: products.length,
    available: products.filter(p => p.available).length,
    unavailable: products.filter(p => !p.available).length,
    lowStock: products.filter(p => p.stock <= 5).length,
  }

  if (loading) {
    return <ProductsHomeSkeleton />
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-lg mt-8 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Erreur</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={fetchProducts}>Réessayer</Button>
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
              <ShoppingBagIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Gestion des Produits
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {products.length} produit{products.length > 1 ? "s" : ""}
              </Badge>
              <Badge
                variant="secondary"
                className="font-normal"
                title="Sélectionnées"
              >
                {table.getFilteredSelectedRowModel().rows.length} sélectionnée
                {table.getFilteredSelectedRowModel().rows.length > 1 ? "s" : ""}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <PermissionGuard permission="products:create">
              <Button asChild>
                <Link href="/dashboard/products/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un produit
                </Link>
              </Button>
            </PermissionGuard>

            <PermissionGuard permission="products:delete">
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
                      {Object.keys(rowSelection).length} produit
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
                <Button variant="outline">
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
                      Recharge les données des produits depuis la base de
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
                  Total Produits
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Disponibles
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.available}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Indisponibles
                </p>
                <p className="text-2xl font-bold text-gray-500">
                  {stats.unavailable}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stock Faible
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.lowStock}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
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
                <TabsTrigger value="tous" className="flex-1 sm:flex-initial">
                  Tous
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="disponibles"
                  className="flex-1 sm:flex-initial"
                >
                  Disponibles
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.available}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="indisponibles"
                  className="flex-1 sm:flex-initial"
                >
                  Indisponibles
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-100 text-gray-800"
                  >
                    {stats.unavailable}
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
                    placeholder="Rechercher par nom, référence..."
                    value={globalFilter ?? ""}
                    onChange={event => setGlobalFilter(event.target.value)}
                    className="pl-8 w-full"
                  />
                </div>

                <Select
                  value={
                    (table.getColumn("stock")?.getFilterValue() as string) ??
                    "all"
                  }
                  onValueChange={value => {
                    table
                      .getColumn("stock")
                      ?.setFilterValue(value === "all" ? undefined : value)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Filtrer par stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Niveaux de stock</SelectLabel>
                      {stockOptions.map(option => (
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
                  onClick={() => fetchProducts()}
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
                            {productsColumnNamesInFrench[column.id] ||
                              column.id}
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
                          <p>Aucun produit trouvé.</p>
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
                produit(s) sélectionné(s).
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Produits par page</p>
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
              Total des produits: <strong>{products.length}</strong> |
              Disponibles:{" "}
              <strong className="text-green-600">{stats.available}</strong> |
              Stock faible:{" "}
              <strong className="text-amber-600">{stats.lowStock}</strong>
            </p>
            <Button variant="outline" size="sm" onClick={() => fetchProducts()}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Actualiser
            </Button>
          </CardFooter>
        </Card>
      </div>
    </RoleGuard>
  )
}
