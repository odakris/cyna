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
  Layers,
  ShoppingBag,
  TagIcon,
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
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  categoriesColumnNamesInFrench,
  categoriesColumns,
  globalFilterFunction,
  productsFilterFn,
} from "./category-columns"
import { Category, Role } from "@prisma/client"
import { CategoryWithProduct } from "@/types/Types"
import PermissionGuard from "@/components/Auth/PermissionGuard"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { CategoryListSkeleton } from "@/components/Skeletons/CategorySkeletons"

// Déclaration pour étendre les FilterFns de TanStack Table
declare module "@tanstack/react-table" {
  interface FilterFns {
    productsFilter: FilterFn<CategoryWithProduct>
    global: FilterFn<CategoryWithProduct>
  }
}

export default function CategoryHomePage() {
  const [categories, setCategories] = useState<CategoryWithProduct[]>([])
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
  const [activeTab, setActiveTab] = useState("toutes")

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: Category[] = await response.json()
      setCategories(data)
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchCategories:", error)
      setError("Erreur lors du chargement des catégories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

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
      dateRange: (row, columnId, filterValue) => {
        const rowValue = new Date(row.getValue(columnId))
        return (
          rowValue >= new Date(filterValue.start) &&
          rowValue <= new Date(filterValue.end)
        )
      },
      stockRange: (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId) as number
        return rowValue >= filterValue.min && rowValue <= filterValue.max
      },
      emailVerifiedFilter: (row, columnId, filterValue) => {
        const rowValue = row.getValue(columnId)
        return rowValue === filterValue
      },
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
    },
  })

  // Filtrage basé sur l'onglet actif (toutes/avec produits/sans produits)
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

  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_category)

    if (selectedIds.length === 0) return

    try {
      const failedDeletions: number[] = []

      for (const id of selectedIds) {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          failedDeletions.push(id)
          const errorData = await response.json()
          console.error(`Erreur de suppression pour l'ID ${id}:`, errorData)
        }
      }

      if (failedDeletions.length > 0) {
        setError(
          `Impossible de supprimer ${failedDeletions.length} catégorie(s). Elles peuvent contenir des produits associés.`
        )
      }

      setShowDeleteDialog(false)
      setRowSelection({})
      await fetchCategories()
    } catch (error: unknown) {
      console.error("Erreur handleDelete:", error)
      setError("Erreur lors de la suppression des catégories")
    }
  }

  // Statistiques pour les cartes
  const stats = {
    total: categories.length,
    withProducts: categories.filter(c => c.products && c.products.length > 0)
      .length,
    withoutProducts: categories.filter(
      c => !c.products || c.products.length === 0
    ).length,
    highPriority: categories.filter(c => c.priority_order <= 3).length,
  }

  if (loading) {
    return <CategoryListSkeleton />
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={fetchCategories} className="w-full sm:w-auto">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de gérer les catégories." />
      }
    >
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TagIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Gestion des Catégories
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {categories.length} catégorie{categories.length > 1 ? "s" : ""}
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
            <PermissionGuard permission="categories:create">
              <Button asChild>
                <Link href="/dashboard/categories/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une catégorie
                </Link>
              </Button>
            </PermissionGuard>

            <PermissionGuard permission="categories:delete">
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
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Confirmer la suppression</DialogTitle>
                    <DialogDescription>
                      Vous êtes sur le point de supprimer{" "}
                      <Badge variant="outline" className="font-semibold mx-1">
                        {Object.keys(rowSelection).length}
                      </Badge>
                      catégorie{Object.keys(rowSelection).length > 1 ? "s" : ""}
                      . Cette action ne peut pas être annulée.
                    </DialogDescription>
                  </DialogHeader>
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Si des produits sont associés à ces catégories, la
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
            </PermissionGuard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="outline" onClick={fetchCategories}>
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
                      Recharge les données des catégories depuis la base de
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
                  Total Catégories
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
                  Avec Produits
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.withProducts}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sans Produits
                </p>
                <p className="text-2xl font-bold text-gray-500">
                  {stats.withoutProducts}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Layers className="h-5 w-5 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Priorité Haute
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.highPriority}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-blue-600" />
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
                <TabsTrigger value="toutes" className="flex-1 sm:flex-initial">
                  Toutes
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="avec-produits"
                  className="flex-1 sm:flex-initial"
                >
                  Avec produits
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.withProducts}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="sans-produits"
                  className="flex-1 sm:flex-initial"
                >
                  Sans produits
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-100 text-gray-800"
                  >
                    {stats.withoutProducts}
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
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une catégorie..."
                  value={globalFilter ?? ""}
                  onChange={event => setGlobalFilter(event.target.value)}
                  className="pl-8 w-full sm:w-80"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Select
                  value={
                    (table
                      .getColumn("priority_order")
                      ?.getFilterValue() as string) ?? "all"
                  }
                  onValueChange={value => {
                    table
                      .getColumn("priority_order")
                      ?.setFilterValue(value === "all" ? undefined : value)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44">
                    <SelectValue placeholder="Filtrer par priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Niveau de priorité</SelectLabel>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      <SelectItem value="high">Haute (≤ 3)</SelectItem>
                      <SelectItem value="medium">Moyenne (4-7)</SelectItem>
                      <SelectItem value="low">Basse ({">"} 7)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fetchCategories()}
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
                            {categoriesColumnNamesInFrench[column.id] ||
                              column.id}
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
                          <p>Aucune catégorie trouvée.</p>
                          <p className="text-sm">
                            Essayez de modifier vos filtres.
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            asChild
                            className="mt-2"
                          >
                            <Link href="/dashboard/categories/new">
                              Créer une catégorie
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
                catégorie(s) sélectionnée(s)
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
              Total des catégories: <strong>{stats.total}</strong> | Avec
              produits:{" "}
              <strong className="text-green-600">{stats.withProducts}</strong> |
              Priorité haute:{" "}
              <strong className="text-blue-600">{stats.highPriority}</strong>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCategories()}
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              Actualiser
            </Button>
          </CardFooter>
        </Card>
      </div>
    </RoleGuard>
  )
}
