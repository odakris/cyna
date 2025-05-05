import { Table as TableType } from "@tanstack/react-table"
import { HeroCarouselSlide } from "@prisma/client"
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
import Image from "next/image"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  SlidersHorizontal,
} from "lucide-react"
import { flexRender } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import HeroCarouselActiveSwitch from "@/components/Admin/HeroCarousel/HeroCarouselActiveSwitch"
import ActionsCell from "@/components/Admin/ActionCell"

interface HeroCarouselTableProps {
  table: TableType<HeroCarouselSlide>
}

export default function HeroCarouselTable({ table }: HeroCarouselTableProps) {
  return (
    <div>
      {/* Version desktop - tableau classique (inchangée) */}
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
                    <p>Aucun slide trouvé.</p>
                    <p className="text-sm">
                      Essayez de modifier vos filtres ou{" "}
                      <Link
                        href="/dashboard/hero-carousel/new"
                        className="text-primary hover:underline"
                      >
                        ajouter un nouveau slide
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
              {/* En-tête de carte avec image et titre - partie cliquable */}
              <Link
                href={`/dashboard/hero-carousel/${row.original.id_hero_slide}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 border-b bg-[#F2F2F2]">
                  <div className="w-16 h-12 border rounded-md overflow-hidden flex-shrink-0 bg-slate-50">
                    <Image
                      src={row.original.image_url}
                      alt={row.original.title}
                      width={64}
                      height={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">
                      {row.original.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        ID: #{row.original.id_hero_slide}
                      </span>
                      <span className="text-xs">•</span>
                      <Badge
                        variant="outline"
                        className={`h-5 px-1.5 text-xs ${
                          row.original.priority_order <= 3
                            ? "bg-red-100 text-red-700 border-red-200"
                            : row.original.priority_order <= 7
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-blue-100 text-blue-700 border-blue-200"
                        }`}
                      >
                        Priorité {row.original.priority_order}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Corps de la carte avec détails et statuts */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    {row.original.button_text ? (
                      <Badge variant="outline" className="bg-slate-100">
                        {row.original.button_text}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Pas de bouton
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Badge
                      variant={row.original.active ? "default" : "outline"}
                      className={
                        row.original.active
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      <SlidersHorizontal className="mr-1 h-3 w-3" />
                      {row.original.active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>

                {/* Description tronquée */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {row.original.description || (
                    <span className="italic">Aucune description</span>
                  )}
                </p>

                {/* Statut et switch */}
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <SlidersHorizontal className="h-3 w-3" />
                    Statut:
                  </span>
                  <HeroCarouselActiveSwitch
                    slideId={row.original.id_hero_slide}
                    initialActive={row.original.active}
                    onStatusChange={() => {}}
                  />
                </div>

                {/* Actions rapides */}
                <div className="flex justify-end mt-3 pt-2 border-t">
                  <ActionsCell
                    actions={[
                      { type: "view", tooltip: "Voir les détails" },
                      { type: "edit", tooltip: "Modifier le slide" },
                      { type: "external", tooltip: "Voir sur le site" },
                    ]}
                    basePath="/dashboard/hero-carousel"
                    entityId={row.original.id_hero_slide}
                    externalBasePath="/"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 border rounded-md">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Aucun slide trouvé.</p>
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
          slide(s) sélectionné(s).
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Slides par page</p>
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
