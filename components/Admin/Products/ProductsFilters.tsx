"use client"

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
import { Category } from "@prisma/client"
import { productsColumnNamesInFrench } from "@/components/Admin/Products/ProductColumns"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface ProductsFiltersProps {
  table: Table<ProductWithImages>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  stockOptions: { value: string; label: string }[]
  fetchProducts: () => Promise<void>
  categories: Category[]
  activeTab: string
  setActiveTab: (tab: string) => void
  stats: {
    total: number
    available: number
    unavailable: number
    lowStock: number
  }
}

export default function ProductsFilters({
  table,
  globalFilter,
  setGlobalFilter,
  stockOptions,
  fetchProducts,
  categories,
  activeTab,
  setActiveTab,
  stats,
}: ProductsFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Version desktop des onglets */}
      <div className="hidden md:block">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="tous" className="flex-1 sm:flex-initial">
              Tous
              <Badge variant="secondary" className="ml-2">
                {stats.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="disponibles" className="flex-1 sm:flex-initial">
              Disponibles
              <Badge
                variant="secondary"
                className="ml-2 bg-green-100 text-green-800"
              >
                {stats.available}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="indisponibles"
              className="flex-1 sm:flex-initial"
            >
              Indisponibles
              <Badge
                variant="secondary"
                className="ml-2 bg-gray-100 text-gray-800"
              >
                {stats.unavailable}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Version desktop des filtres */}
      <div className="hidden md:flex md:flex-row md:justify-between md:items-center md:gap-4">
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

          <Select
            value={
              table.getColumn("id_category")?.getFilterValue()
                ? table.getColumn("id_category")?.getFilterValue()?.toString()
                : "all"
            }
            onValueChange={(value: string) => {
              table
                .getColumn("id_category")
                ?.setFilterValue(value === "all" ? undefined : parseInt(value))
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Catégories</SelectLabel>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem
                    key={category.id_category}
                    value={category.id_category.toString()}
                  >
                    {category.name}
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
                      onCheckedChange={value =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {productsColumnNamesInFrench[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Version mobile des filtres */}
      <div className="md:hidden space-y-3 mt-0">
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

        {/* Sélecteur Tous/Disponibles/Indisponibles */}
        <div className="flex space-x-2">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Tous les produits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous ({stats.total})</SelectItem>
              <SelectItem value="disponibles">
                Disponibles ({stats.available})
              </SelectItem>
              <SelectItem value="indisponibles">
                Indisponibles ({stats.unavailable})
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => fetchProducts()}
            className="shrink-0"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Filtres de stock et catégorie */}
        <div className="flex gap-2">
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
            <SelectTrigger>
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              {stockOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              table.getColumn("id_category")?.getFilterValue()?.toString() ||
              "all"
            }
            onValueChange={value => {
              table
                .getColumn("id_category")
                ?.setFilterValue(value === "all" ? undefined : parseInt(value))
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Catégories</SelectItem>
              {categories.map(category => (
                <SelectItem
                  key={category.id_category}
                  value={category.id_category.toString()}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
