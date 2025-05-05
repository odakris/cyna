import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Search, RefreshCw, Columns, ChevronDown } from "lucide-react"
import {
  ContactMessage,
  contactMessageColumnNamesInFrench,
} from "@/components/Admin/ContactMessages/ContactMessageColumns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ContactMessageFiltersProps {
  table: Table<ContactMessage>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  fetchMessages: () => Promise<void>
  fetchStats: () => Promise<void>
  activeTab?: string
  setActiveTab?: (tab: string) => void
  stats?: {
    total: number
    unread: number
    unanswered: number
    lastWeek: number
  }
}

export default function ContactMessageFilters({
  table,
  globalFilter,
  setGlobalFilter,
  fetchMessages,
  fetchStats,
  activeTab,
  setActiveTab,
  stats,
}: ContactMessageFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Version mobile des onglets - nouvelle version */}
      {activeTab && setActiveTab && stats && (
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

          {/* Sélecteur Tous/Non lus/Lus/Répondus */}
          <div className="flex space-x-2">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les messages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous ({stats.total})</SelectItem>
                <SelectItem value="non-lus">
                  Non lus ({stats.unread})
                </SelectItem>
                <SelectItem value="lus">
                  Lus ({stats.total - stats.unread})
                </SelectItem>
                <SelectItem value="repondus">
                  Répondus ({stats.total - stats.unanswered})
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                fetchMessages()
                fetchStats()
              }}
              className="shrink-0"
              title="Actualiser"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Version desktop des filtres - inchangée */}
      <div className="hidden md:flex md:flex-row md:justify-between md:items-center md:gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les messages..."
              value={globalFilter ?? ""}
              onChange={event => setGlobalFilter(event.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              fetchMessages()
              fetchStats()
            }}
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
                      {contactMessageColumnNamesInFrench[column.id] ||
                        column.id}
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
