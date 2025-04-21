"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ChevronsLeft,
  ChevronsRight,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
  Filter,
  Columns,
  Mail,
  MailCheck,
  MailQuestion,
  MailIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
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
  contactMessageColumns,
  contactMessageColumnNamesInFrench,
  globalFilterFunction,
  ContactMessage,
} from "./contact-message-columns"
import PermissionGuard from "@/components/Auth/PermissionGuard"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { ContactMessageListSkeleton } from "@/components/Skeletons/ContactMessageSkeletons"

export default function ContactMessageDashboard() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [sorting, setSorting] = useState<SortingState>([
    { id: "sent_date", desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [globalFilter, setGlobalFilter] = useState("")
  const [activeTab, setActiveTab] = useState("tous")
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    unanswered: 0,
    lastWeek: 0,
  })
  const { toast } = useToast()

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contact-message`)

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: ContactMessage[] = await response.json()
      setMessages(data)
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchMessages:", error)
      setError("Erreur lors du chargement des messages")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/contact-message/stats")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setStats(data)
    } catch (error: unknown) {
      console.error("Erreur fetchStats:", error)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
    fetchStats()
  }, [fetchMessages, fetchStats])

  const table = useReactTable({
    data: messages,
    columns: contactMessageColumns,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      productsFilter: (row, columnId, filterValue) => true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      dateRange: (row, columnId, filterValue) => true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      stockRange: (row, columnId, filterValue) => true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emailVerifiedFilter: (row, columnId, filterValue) => true,
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
    } else if (activeTab === "lus") {
      table.getColumn("is_read")?.setFilterValue("read")
    } else if (activeTab === "non-lus") {
      table.getColumn("is_read")?.setFilterValue("unread")
    } else if (activeTab === "repondus") {
      table.getColumn("is_read")?.setFilterValue("responded")
    }
  }, [activeTab, table])

  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_message)

    if (selectedIds.length === 0) return

    try {
      for (const id of selectedIds) {
        const response = await fetch(`/api/contact-message/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })
        if (!response.ok) {
          throw new Error(`Error deleting message ${id}`)
        }
      }
      setShowDeleteDialog(false)
      setRowSelection({})
      toast({
        title: "Succès",
        description: `${selectedIds.length} message(s) supprimé(s)`,
      })
      await fetchMessages()
      await fetchStats()
    } catch (error: unknown) {
      console.error("Erreur handleDelete:", error)
      setError("Erreur lors de la suppression des messages")
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer les messages sélectionnés",
      })
    }
  }

  // Écouter les événements personnalisés
  useEffect(() => {
    const handleDeleteMessage = (event: Event) => {
      const { id } = (event as CustomEvent).detail
      setRowSelection({ [id]: true })
      setShowDeleteDialog(true)
    }

    document.addEventListener("delete-contact-message", handleDeleteMessage)

    return () => {
      document.removeEventListener(
        "delete-contact-message",
        handleDeleteMessage
      )
    }
  }, [])

  if (loading) {
    return <ContactMessageListSkeleton />
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
          <Button onClick={fetchMessages}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de gérer les messages de contact." />
      }
    >
      <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MailIcon className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Messages de Contact
              </h1>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-normal">
                {messages.length} message{messages.length > 1 ? "s" : ""}
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
                      {Object.keys(rowSelection).length} message
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
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchMessages()
                    fetchStats()
                  }}
                >
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
                      Recharge les messages de contact depuis la base de
                      données.
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Messages
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Non lus
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.unread}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <MailQuestion className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Sans réponse
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.unanswered}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  7 derniers jours
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.lastWeek}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <MailCheck className="h-5 w-5 text-green-600" />
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
                <TabsTrigger value="non-lus" className="flex-1 sm:flex-initial">
                  Non lus
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-800"
                  >
                    {stats.unread}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="lus" className="flex-1 sm:flex-initial">
                  Lus
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-100 text-gray-800"
                  >
                    {stats.total - stats.unread}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="repondus"
                  className="flex-1 sm:flex-initial"
                >
                  Répondus
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.total - stats.unanswered}
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
                    placeholder="Rechercher dans les messages..."
                    value={globalFilter ?? ""}
                    onChange={event => setGlobalFilter(event.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    fetchMessages()
                    fetchStats()
                  }}
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
                            {contactMessageColumnNamesInFrench[column.id] ||
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
                        className={`group transition-colors ${
                          row.getIsSelected()
                            ? "bg-primary/5"
                            : row.original.is_read
                              ? "hover:bg-muted/50"
                              : "bg-blue-50/50 hover:bg-blue-100/50"
                        }`}
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
                          <p>Aucun message trouvé.</p>
                          <p className="text-sm">
                            Essayez de modifier vos filtres ou vérifiez que vous
                            avez reçu des messages.
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
                message(s) sélectionné(s).
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Messages par page</p>
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
              Total des messages: <strong>{stats.total}</strong> | Non lus:{" "}
              <strong className="text-blue-600">{stats.unread}</strong> | Sans
              réponse:{" "}
              <strong className="text-amber-600">{stats.unanswered}</strong>
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                fetchMessages()
                fetchStats()
              }}
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
