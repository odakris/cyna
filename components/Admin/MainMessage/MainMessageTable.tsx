import Link from "next/link"
import { Table as TableType } from "@tanstack/react-table"
import { MainMessage } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  MessageCircle,
  Calendar,
  SlidersHorizontal,
  Palette,
} from "lucide-react"
import { flexRender } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import MainMessageActiveSwitch from "./MainMessageActiveSwitch"
import ActionsCell from "@/components/Admin/ActionCell"

interface MainMessageTableProps {
  table: TableType<MainMessage>
}

export default function MainMessageTable({ table }: MainMessageTableProps) {
  // Récupérer la fonction toggleMessageActive depuis les meta options de la table
  const toggleMessageActive = table.options.meta?.toggleMessageActive

  return (
    <div>
      {/* Version desktop - tableau classique (inchangé) */}
      <div className="hidden md:block rounded-md border overflow-hidden">
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
                    <p>Aucun message trouvé.</p>
                    <p className="text-sm">
                      Essayez de modifier vos filtres ou{" "}
                      <Link
                        href="/dashboard/main-message/new"
                        className="text-primary hover:underline"
                      >
                        ajouter un nouveau message
                      </Link>
                      .
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
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              {/* En-tête de carte avec le message - partie cliquable */}
              <Link
                href={`/dashboard/main-message/${row.original.id_main_message}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 border-b bg-[#F2F2F2]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        ID: #{row.original.id_main_message}
                      </span>
                    </div>
                    <div
                      className={`mt-2 py-2 px-3 rounded ${
                        row.original.has_background &&
                        row.original.background_color
                          ? row.original.background_color
                          : "bg-primary/5"
                      }`}
                    >
                      <p
                        className={cn(
                          "text-sm font-bold",
                          row.original.text_color
                            ? row.original.text_color
                            : "text-foreground"
                        )}
                      >
                        {row.original.content.length > 60
                          ? `${row.original.content.substring(0, 60)}...`
                          : row.original.content}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Corps de la carte avec détails et statuts - partie non cliquable */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Statut:
                    </span>
                    <Badge
                      variant={row.original.active ? "default" : "outline"}
                      className={
                        row.original.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200 h-5 px-1.5 text-xs"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200 h-5 px-1.5 text-xs"
                      }
                    >
                      {row.original.active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <MainMessageActiveSwitch
                    messageId={row.original.id_main_message}
                    active={row.original.active}
                    toggleMessageActive={toggleMessageActive}
                    onStatusChange={newStatus => {
                      // Mise à jour du statut local si nécessaire
                      row.original.active = newStatus
                    }}
                  />
                </div>

                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Arrière-plan:
                    </span>
                    {row.original.has_background ? (
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-200 h-5 px-1.5 text-xs"
                      >
                        Activé
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800 border-gray-200 h-5 px-1.5 text-xs"
                      >
                        Désactivé
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Mis à jour le{" "}
                    {new Date(row.original.updated_at).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>

                {/* Actions rapides */}
                <div className="flex justify-end mt-3">
                  <ActionsCell
                    actions={[
                      { type: "view", tooltip: "Voir les détails" },
                      { type: "edit", tooltip: "Modifier le message" },
                      { type: "external_main", tooltip: "Voir sur le site" },
                    ]}
                    basePath="/dashboard/main-message"
                    entityId={row.original.id_main_message}
                    externalBasePath="/"
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
            <p className="text-sm font-medium">Par page</p>
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
