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
import { CategoryWithProduct } from "@/types/Types"
import { categoriesColumnNamesInFrench } from "@/components/Admin/Categories/CategoriesColumns"

interface CategoriesFiltersProps {
  table: Table<CategoryWithProduct>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  fetchCategories: () => Promise<void>
}

export default function CategoriesFilters({
  table,
  globalFilter,
  setGlobalFilter,
  fetchCategories,
}: CategoriesFiltersProps) {
  return (
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
            (table.getColumn("priority_order")?.getFilterValue() as string) ??
            "all"
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
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {categoriesColumnNamesInFrench[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
