import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, RefreshCw, Columns, ChevronDown } from "lucide-react"
import { HeroCarouselSlide } from "@prisma/client"
import { heroCarouselColumnNamesInFrench } from "@/components/Admin/HeroCarousel/HeroCarouselColumns"

interface HeroCarouselFiltersProps {
  table: Table<HeroCarouselSlide>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  fetchSlides: () => Promise<void>
  activeTab: string
  setActiveTab: (tab: string) => void
  stats?: {
    total: number
    active: number
    inactive: number
    highPriority: number
  }
}

export default function HeroCarouselFilters({
  table,
  globalFilter,
  setGlobalFilter,
  fetchSlides,
  activeTab,
  setActiveTab,
  stats = { total: 0, active: 0, inactive: 0, highPriority: 0 }, // Valeur par défaut
}: HeroCarouselFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Version mobile des filtres */}
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

        {/* Sélecteur Tous/Actifs/Inactifs et bouton actualiser sur la même ligne */}
        <div className="flex space-x-2">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tous les slides" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous ({stats?.total || 0})</SelectItem>
              <SelectItem value="actifs">
                Actifs ({stats?.active || 0})
              </SelectItem>
              <SelectItem value="inactifs">
                Inactifs ({stats?.inactive || 0})
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => fetchSlides()}
            className="shrink-0"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Version desktop des filtres - inchangée */}
      <div className="hidden md:flex md:flex-row md:justify-between md:items-center md:gap-4">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par titre..."
            value={globalFilter ?? ""}
            onChange={event => setGlobalFilter(event.target.value)}
            className="pl-8 w-full sm:w-80"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchSlides()}
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
                      {heroCarouselColumnNamesInFrench[column.id] || column.id}
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
