import { Table as TableType } from "@tanstack/react-table"
import { OrderWithItems } from "@/types/Types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  CreditCard,
} from "lucide-react"
import { flexRender } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import ActionsCell from "@/components/Admin/ActionCell"

interface OrdersTableProps {
  table: TableType<OrderWithItems>
}

export default function OrdersTable({ table }: OrdersTableProps) {
  return (
    <div>
      {/* Version desktop - tableau classique (inchangé) */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-center px-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
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
                  colSpan={Object.keys(table.getVisibleLeafColumns()).length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Filter className="h-8 w-8 mb-2 opacity-50" />
                    <p>Aucune commande trouvée.</p>
                    <p className="text-sm">Essayez de modifier vos filtres.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vue mobile en liste de cartes */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => (
            <div
              key={row.id}
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              {/* En-tête de carte avec numéro et date - partie cliquable */}
              <Link
                href={`/dashboard/orders/${row.original.id_order}`}
                className="block"
              >
                <div className="flex items-center justify-between p-3 border-b bg-[#F2F2F2]">
                  <div>
                    <h3 className="font-medium text-base">
                      Commande #{row.original.id_order}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {format(
                        new Date(row.original.order_date),
                        "dd MMM yyyy",
                        { locale: fr }
                      )}
                    </p>
                  </div>
                  <div>
                    {/* Statut de la commande */}
                    {getStatusBadge(row.original.order_status)}
                  </div>
                </div>
              </Link>

              {/* Corps de la carte avec détails */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <p className="text-xs">
                      {row.original.user.first_name}{" "}
                      {row.original.user.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-right">Montant</p>
                    <p className="text-sm font-bold text-right text-green-600">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(row.original.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {row.original.payment_method}
                      {row.original.last_card_digits &&
                        ` *${row.original.last_card_digits}`}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {row.original.order_items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      article(s)
                    </Badge>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex justify-end mt-3">
                  <ActionsCell
                    actions={[
                      { type: "view", tooltip: "Voir les détails" },
                      {
                        type: "download_receipt",
                        tooltip: "Télécharger la facture",
                      },
                    ]}
                    basePath="/dashboard/orders"
                    entityId={row.original.id_order}
                    invoicePdfUrl={
                      `/api/invoices/${row.original.id_order}` || "#"
                    }
                    externalBasePath="/orders"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 border rounded-md">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Aucune commande trouvée.</p>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos filtres.
            </p>
          </div>
        )}
      </div>

      {/* Pagination desktop - inchangée */}
      <div className="hidden md:flex md:flex-col md:sm:flex-row md:justify-between md:space-y-4 md:sm:space-y-0 py-4">
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

      {/* Pagination mobile - nouvelle */}
      <div className="flex flex-col items-center space-y-3 py-4 md:hidden">
        <div className="text-xs text-muted-foreground text-center">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount() || 1}
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={value => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50].map(pageSize => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Fonction utilitaire pour générer les badges de statut
function getStatusBadge(status: string) {
  const statusConfig = {
    PENDING: {
      label: "En attente",
      class: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <Clock className="mr-1 h-3 w-3" />,
    },
    PROCESSING: {
      label: "En traitement",
      class: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <Loader2 className="mr-1 h-3 w-3 animate-spin" />,
    },
    ACTIVE: {
      label: "Active",
      class: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
    },
    COMPLETED: {
      label: "Terminée",
      class: "bg-green-100 text-green-800 border-green-200",
      icon: <CheckCircle2 className="mr-1 h-3 w-3" />,
    },
    CANCELLED: {
      label: "Annulée",
      class: "bg-red-100 text-red-800 border-red-200",
      icon: <XCircle className="mr-1 h-3 w-3" />,
    },
    REFUNDED: {
      label: "Remboursée",
      class: "bg-purple-100 text-purple-800 border-purple-200",
      icon: <RefreshCcw className="mr-1 h-3 w-3" />,
    },
    PAID: {
      label: "Payée",
      class: "bg-green-100 text-green-800 border-green-200",
      icon: <CreditCard className="mr-1 h-3 w-3" />,
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || {
    label: status,
    class: "bg-gray-100 text-gray-800 border-gray-200",
    icon: null,
  }

  return (
    <Badge variant="outline" className={`font-medium text-xs ${config.class}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
