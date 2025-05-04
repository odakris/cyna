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
  activeTab: string
  setActiveTab: (tab: string) => void
  stats: {
    total: number
    withProducts: number
    withoutProducts: number
    highPriority: number
  }
}

export default function CategoriesFilters({
  table,
  globalFilter,
  setGlobalFilter,
  fetchCategories,
  activeTab,
  setActiveTab,
  stats,
}: CategoriesFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Version mobile des onglets */}
      <div className="md:hidden space-y-3">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={globalFilter ?? ""}
            onChange={event => setGlobalFilter(event.target.value)}
            className="pl-8 w-full"
          />
        </div>

        {/* Sélecteur Toutes/Avec produits/Sans produits */}
        <div className="flex space-x-2">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="toutes">Toutes ({stats.total})</SelectItem>
              <SelectItem value="avec-produits">
                Avec produits ({stats.withProducts})
              </SelectItem>
              <SelectItem value="sans-produits">
                Sans produits ({stats.withoutProducts})
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => fetchCategories()}
            className="shrink-0"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtre de priorité */}
        <div>
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
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrer par priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les priorités</SelectItem>
              <SelectItem value="high">Haute (≤ 3)</SelectItem>
              <SelectItem value="medium">Moyenne (4-7)</SelectItem>
              <SelectItem value="low">Basse ({">"} 7)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Version desktop des filtres - inchangée */}
      <div className="hidden md:flex md:flex-row md:justify-between md:items-center md:gap-4">
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
                      onCheckedChange={value =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {categoriesColumnNamesInFrench[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
