import { Table as TableType } from "@tanstack/react-table"
import { Conversation } from "@/components/Admin/Conversations/ConversationColumns"
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
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  User,
  Clock,
  Calendar,
} from "lucide-react"
import { flexRender } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/components/Admin/Conversations/ConversationColumns"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ActionsCell from "@/components/Admin/ActionCell"

interface ConversationTableProps {
  table: TableType<Conversation>
}

export default function ConversationTable({ table }: ConversationTableProps) {
  return (
    <div>
      {/* Version desktop - tableau classique */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
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
                    row.getIsSelected() ? "bg-primary/5" : "hover:bg-muted/50"
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
                    <p>Aucune conversation trouvée.</p>
                    <p className="text-sm">
                      Essayez de modifier vos filtres ou vérifiez que vous avez
                      des conversations actives.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Version mobile en liste de cartes */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => (
            <div
              key={row.id}
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              {/* En-tête de carte avec les informations du client - partie cliquable */}
              <Link
                href={`/dashboard/conversations/${row.original.id_conversation}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 border-b bg-[#F2F2F2]">
                  <Avatar className="h-10 w-10 border">
                    <AvatarFallback>
                      {row.original.user?.first_name?.charAt(0) ||
                        row.original.user?.email?.charAt(0) || (
                          <User className="h-4 w-4" />
                        )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">
                      {row.original.user?.first_name &&
                      row.original.user?.last_name
                        ? `${row.original.user.first_name} ${row.original.user.last_name}`
                        : "Client anonyme"}
                    </h3>
                    <div className="text-xs text-muted-foreground truncate">
                      {row.original.email ||
                        row.original.user?.email ||
                        "Email inconnu"}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Corps de la carte avec détails */}
              <div className="p-3">
                {/* Dernier message */}
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Dernier message:
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-5 px-1.5 text-xs">
                      {row.original.messages && row.original.messages.length > 0
                        ? row.original.messages[0].message_type === "USER"
                          ? "Client"
                          : row.original.messages[0].message_type === "ADMIN"
                            ? "Admin"
                            : "Bot"
                        : "Aucun"}
                    </Badge>
                    <p className="text-sm line-clamp-1">
                      {row.original.messages && row.original.messages.length > 0
                        ? row.original.messages[0].content.length > 50
                          ? row.original.messages[0].content.substring(0, 50) +
                            "..."
                          : row.original.messages[0].content
                        : "Pas de message"}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Créée: {formatDate(row.original.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      Mise à jour: {formatDate(row.original.updated_at)}
                    </span>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex justify-end mt-3 border-t pt-3">
                  <ActionsCell
                    actions={[{ type: "view", tooltip: "Voir les détails" }]}
                    basePath="/dashboard/conversations"
                    entityId={row.original.id_conversation}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-6 border rounded-md">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">
              Aucune conversation trouvée.
            </p>
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
          conversation(s) sélectionnée(s).
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Conversations par page</p>
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
            {table.getPageCount() || 1}
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

      {/* Pagination mobile */}
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
