import { Table as TableType } from "@tanstack/react-table"
import { ContactMessage } from "@/components/Admin/ContactMessages/ContactMessageColumns"
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
} from "lucide-react"
import { flexRender } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ActionsCell from "@/components/Admin/ActionCell"
import Link from "next/link"

interface ContactMessageTableProps {
  table: TableType<ContactMessage>
}

export default function ContactMessageTable({
  table,
}: ContactMessageTableProps) {
  // Fonction pour formater la date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Fonction pour tronquer le texte
  const truncateText = (text: string, maxLength = 50) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div>
      {/* Tableau classique pour desktop - INCHANGÉ */}
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
                  colSpan={Object.keys(table.getVisibleLeafColumns()).length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Filter className="h-8 w-8 mb-2 opacity-50" />
                    <p>Aucun message trouvé.</p>
                    <p className="text-sm">
                      Essayez de modifier vos filtres ou vérifiez que vous avez
                      reçu des messages.
                    </p>
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
              className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all ${
                !row.original.is_read ? "border-blue-200" : ""
              }`}
            >
              {/* En-tête de carte avec info et statut - partie cliquable */}
              <Link
                href={`/dashboard/contact/${row.original.id_message}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 border-b bg-[#F2F2F2]">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-base truncate ${!row.original.is_read ? "font-semibold" : ""}`}
                    >
                      {row.original.subject}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground truncate">
                        {row.original.email}
                      </span>
                      <span className="text-xs">•</span>
                      <Badge
                        variant="outline"
                        className={`h-5 px-1.5 text-xs ${
                          row.original.is_responded
                            ? "bg-green-100 text-green-800 border-green-200"
                            : !row.original.is_read
                              ? "bg-blue-100 text-blue-800 border-blue-200 animate-pulse"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {row.original.is_responded
                          ? "Répondu"
                          : row.original.is_read
                            ? "Lu"
                            : "Non lu"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Corps de la carte avec message tronqué */}
              <div className="p-3">
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {truncateText(row.original.message, 120)}
                  </p>
                </div>

                {/* Date et actions */}
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(row.original.sent_date)}
                  </div>

                  <ActionsCell
                    actions={[
                      { type: "view", tooltip: "Voir les détails" },
                      { type: "reply", tooltip: "Répondre" },
                    ]}
                    basePath="/dashboard/contact"
                    entityId={row.original.id_message}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 border rounded-md">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Aucun message trouvé.</p>
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

      {/* Pagination mobile - NOUVELLE */}
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
