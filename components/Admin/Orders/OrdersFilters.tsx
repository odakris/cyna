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
import { OrderWithItems } from "@/types/Types"
import { ordersColumnNamesInFrench } from "@/components/Admin/Orders/OrdersColumns"

interface OrdersFiltersProps {
  table: Table<OrderWithItems>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  dateOptions: { value: string; label: string }[]
  fetchOrders: () => Promise<void>
}

export default function OrdersFilters({
  table,
  globalFilter,
  setGlobalFilter,
  dateOptions,
  fetchOrders,
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par n°, client..."
            value={globalFilter ?? ""}
            onChange={event => setGlobalFilter(event.target.value)}
            className="pl-8 w-full"
          />
        </div>

        <Select
          value={
            (table.getColumn("order_date")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={value => {
            table
              .getColumn("order_date")
              ?.setFilterValue(value === "all" ? undefined : value)
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filtrer par date" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Période</SelectLabel>
              {dateOptions.map(option => (
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
          onClick={() => fetchOrders()}
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
                    {ordersColumnNamesInFrench[column.id] || column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
