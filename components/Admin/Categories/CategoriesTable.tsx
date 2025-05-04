import { Table as TableType } from "@tanstack/react-table"
import { CategoryWithProduct } from "@/types/Types"
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
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Layers,
} from "lucide-react"
import { flexRender } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import CategoryActiveSwitch from "./CategoryActiveSwitch"
import ActionsCell from "@/components/Admin/ActionCell"

interface CategoriesTableProps {
  table: TableType<CategoryWithProduct>
}

export default function CategoriesTable({ table }: CategoriesTableProps) {
  return (
    <div>
      {/* Version desktop - tableau classique (inchangé) */}
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
                    <p>Aucune catégorie trouvée.</p>
                    <p className="text-sm">Essayez de modifier vos filtres.</p>
                    <Button variant="link" size="sm" asChild className="mt-2">
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

      {/* Vue mobile en liste de cartes  */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => (
            <div
              key={row.id}
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              {/* En-tête de carte avec image et nom - partie cliquable */}
              <Link
                href={`/dashboard/categories/${row.original.id_category}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 border-b bg-[#F2F2F2]">
                  <div className="w-14 h-14 border rounded-md overflow-hidden flex-shrink-0 bg-slate-50">
                    <Image
                      src={row.original.image}
                      alt={row.original.name}
                      width={56}
                      height={56}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base truncate">
                      {row.original.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        ID: #{row.original.id_category}
                      </span>
                      <span className="text-xs">•</span>
                      <Badge
                        variant="outline"
                        className={`h-5 px-1.5 text-xs ${
                          row.original.priority_order <= 3
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : row.original.priority_order <= 7
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        Priorité {row.original.priority_order}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Corps de la carte avec détails et statuts - partie non cliquable */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        (row.original.products?.length || 0) > 0
                          ? "outline"
                          : "secondary"
                      }
                      className={
                        (row.original.products?.length || 0) > 0
                          ? "bg-green-100 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }
                    >
                      <Layers className="mr-1 h-3 w-3" />
                      {row.original.products?.length || 0} produit
                      {(row.original.products?.length || 0) !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <CategoryActiveSwitch
                      categoryId={row.original.id_category}
                      initialActive={row.original.active}
                      onStatusChange={() => {}}
                    />
                  </div>
                </div>

                {/* Description tronquée */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {row.original.description || (
                    <span className="italic">Aucune description</span>
                  )}
                </p>

                {/* Actions rapides */}
                <div className="flex justify-end mt-3">
                  <ActionsCell
                    actions={[
                      { type: "view", tooltip: "Voir les détails" },
                      { type: "edit", tooltip: "Modifier la categorie" },
                      { type: "external", tooltip: "Voir sur le site" },
                    ]}
                    basePath="/dashboard/categories"
                    entityId={row.original.id_category}
                    externalBasePath="/categorie"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 border rounded-md">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Aucune catégorie trouvée.</p>
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
          catégorie(s) sélectionnée(s)
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
