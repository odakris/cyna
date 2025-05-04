import { Table as TableType } from "@tanstack/react-table"
import { ProductWithImages } from "@/types/Types"
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
import { flexRender } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  CheckCircle2,
  XCircle,
  Package,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ProductActiveSwitch from "@/components/Admin/Products/ProductActiveSwitch"
import ActionsCell from "@/components/Admin/ActionCell"

interface ProductsTableProps {
  table: TableType<ProductWithImages>
}

export default function ProductsTable({ table }: ProductsTableProps) {
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
                    <p>Aucun produit trouvé.</p>
                    <p className="text-sm">Essayez de modifier vos filtres.</p>
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
                href={`/dashboard/products/${row.original.id_product}`}
                className="block"
              >
                <div className="flex items-center gap-3 p-3 border-b bg-[#F2F2F2]">
                  <div className="w-14 h-14 border rounded-md overflow-hidden flex-shrink-0 bg-slate-50">
                    <Image
                      src={row.original.main_image || "/placeholder.png"}
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
                        Réf: #{row.original.id_product}
                      </span>
                      <span className="text-xs">•</span>
                      <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-xs bg-sky-100 text-sky-700 border-sky-200 truncate max-w-[100px]"
                      >
                        {row.original.category?.name || "Non catégorisé"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Corps de la carte avec détails et statuts - partie non cliquable */}
              <div className="p-3">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-baseline gap-1">
                    <span className="font-semibold text-lg">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(row.original.unit_price)}
                    </span>
                    <span className="text-xs text-muted-foreground">TTC</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`
                  ${
                    row.original.stock === 0
                      ? "bg-red-100 text-red-800 border-red-300"
                      : row.original.stock <= 5
                        ? "bg-amber-100 text-amber-800 border-amber-300"
                        : "bg-green-100 text-green-800 border-green-300"
                  }
                `}
                    >
                      <Package className="mr-1 h-3 w-3" />
                      {row.original.stock}
                    </Badge>
                  </div>
                </div>

                {/* Description tronquée */}
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {row.original.description || (
                    <span className="italic">Aucune description</span>
                  )}
                </p>

                {/* Statuts et switch */}
                <div className="flex justify-between items-center mt-3">
                  <div className="flex flex-wrap gap-2">
                    {row.original.available ? (
                      <Badge className="bg-emerald-500 text-white border-emerald-600">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Disponible
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-800 border-slate-200"
                      >
                        <XCircle className="mr-1 h-3 w-3" /> Indisponible
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center">
                    <ProductActiveSwitch
                      productId={row.original.id_product}
                      initialActive={row.original.active}
                      onStatusChange={() => {}}
                    />
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="flex justify-end mt-3">
                  <ActionsCell
                    actions={[
                      { type: "view", tooltip: "Voir les détails" },
                      { type: "edit", tooltip: "Modifier le produit" },
                      { type: "external", tooltip: "Voir sur le site" },
                    ]}
                    basePath="/dashboard/products"
                    entityId={row.original.id_product}
                    externalBasePath="/produit"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center p-8 border rounded-md">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Aucun produit trouvé.</p>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos filtres.
            </p>
          </div>
        )}
      </div>

      {/* Pagination desktop - INCHANGÉE */}
      <div className="hidden md:flex md:flex-row md:items-center md:justify-between md:space-y-0 py-4">
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
