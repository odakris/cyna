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
  Conversation,
  conversationColumnNamesInFrench,
} from "@/components/Admin/Conversations/ConversationColumns"

interface ConversationFiltersProps {
  table: Table<Conversation>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  fetchConversations: () => Promise<void>
}

export default function ConversationFilters({
  table,
  globalFilter,
  setGlobalFilter,
  fetchConversations,
}: ConversationFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      {/* Version desktop des filtres */}
      <div className="hidden md:flex md:flex-row md:justify-between md:items-center md:gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les conversations..."
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
            onClick={fetchConversations}
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
                      {conversationColumnNamesInFrench[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Version mobile des filtres */}
      <div className="md:hidden space-y-3">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={globalFilter ?? ""}
            onChange={event => setGlobalFilter(event.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            className="text-xs w-full"
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Actualiser
          </Button>
        </div>
      </div>
    </div>
  )
}
