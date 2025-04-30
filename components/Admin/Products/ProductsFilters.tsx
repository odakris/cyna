import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, RefreshCw, Columns, ChevronDown } from "lucide-react"
import { ProductWithImages } from "@/types/Types"
import { productsColumnNamesInFrench } from "@/components/Admin/Products/ProductColumns"

interface ProductsFiltersProps {
  table: Table<ProductWithImages>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  stockOptions: { value: string; label: string }[]
  fetchProducts: () => Promise<void>
}

export default function ProductsFilters({
  table,
  globalFilter,
  setGlobalFilter,
  stockOptions,
  fetchProducts,
}: ProductsFiltersProps) {
  return (
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
            (table.getColumn("stock")?.getFilterValue() as string) ?? "all"
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
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {productsColumnNamesInFrench[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
