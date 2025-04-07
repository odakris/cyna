import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import {
  ArrowUpDown,
  Eye,
  CreditCard,
  Tag,
  Calendar,
  Package,
  Check,
  X,
  PencilLine,
  User,
  Receipt,
  CheckCircle,
} from "lucide-react"
import { Clock, Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { FilterFn } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { OrderWithItems } from "@/types/Types"

declare module "@tanstack/react-table" {
  interface FilterFns {
    dateRange: FilterFn<OrderWithItems>
  }
}

export const orderColumns: ColumnDef<OrderWithItems>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Sélectionner tout"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={value => row.toggleSelected(!!value)}
        aria-label="Sélectionner la ligne"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id_order",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Receipt className="mr-2 h-4 w-4 text-muted-foreground" />
          N° Commande
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const id = row.getValue("id_order") as number
      return (
        <div className="font-medium text-center">
          <Badge variant="outline">#{id}</Badge>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "order_date",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("order_date"))
      const formattedDate = format(date, "dd MMM yyyy", { locale: fr })
      const formattedTime = format(date, "HH:mm", { locale: fr })

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center font-medium">{formattedDate}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Passée le {formattedDate} à {formattedTime}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    filterFn: "dateRange",
    enableSorting: true,
  },
  {
    accessorKey: "user",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <User className="mr-2 h-4 w-4 text-muted-foreground" />
          Client
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const user = row.getValue("user") as OrderWithItems["user"]
      return (
        <div className="text-center">
          <div className="font-medium">
            {user.first_name} {user.last_name}
          </div>
          <div className="text-xs text-muted-foreground">{user.email}</div>
        </div>
      )
    },
    sortingFn: (rowA, rowB, columnId) => {
      const userA = rowA.getValue(columnId) as OrderWithItems["user"]
      const userB = rowB.getValue(columnId) as OrderWithItems["user"]
      return `${userA.last_name} ${userA.first_name}`.localeCompare(
        `${userB.last_name} ${userB.first_name}`
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "total_amount",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
          Montant
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const amount = row.getValue("total_amount") as number
      const formattedAmount = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
      }).format(amount)

      return (
        <div className="text-center font-bold">
          <span
            className={cn(
              amount > 500
                ? "text-violet-600"
                : amount > 200
                  ? "text-blue-600"
                  : "text-green-600"
            )}
          >
            {formattedAmount}
          </span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "order_items",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
          Articles
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const orderItems = row.getValue(
        "order_items"
      ) as OrderWithItems["order_items"]
      const totalItems = orderItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      )

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                <Badge variant="secondary">
                  {totalItems} article{totalItems > 1 ? "s" : ""}
                </Badge>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <ul className="space-y-1 text-sm">
                {orderItems.map(item => (
                  <li key={item.id_order_item} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-semibold ml-4">
                      {new Intl.NumberFormat("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      }).format(item.unit_price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    sortingFn: (rowA, rowB, columnId) => {
      const itemsA = rowA.getValue(columnId) as OrderWithItems["order_items"]
      const itemsB = rowB.getValue(columnId) as OrderWithItems["order_items"]
      return itemsA.length - itemsB.length
    },
    enableSorting: true,
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
          Paiement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const paymentMethod = row.getValue("payment_method") as string
      const lastCardDigits = row.original.last_card_digits

      return (
        <div className="text-center">
          <Badge variant="outline" className="font-medium">
            {paymentMethod}
            {lastCardDigits && ` *${lastCardDigits}`}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "order_status",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const status = row.getValue("order_status") as string

      const statusConfig = {
        PENDING: {
          label: "En attente",
          class: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="mr-1 h-3 w-3" />,
        },
        PROCESSING: {
          label: "En traitement",
          class: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Loader2 className="mr-1 h-3 w-3 animate-spin" />,
        },
        ACTIVE: {
          label: "Active",
          class: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <CheckCircle className="mr-1 h-3 w-3" />,
        },
        COMPLETED: {
          label: "Terminée",
          class: "bg-green-100 text-green-800 border-green-200",
          icon: <Check className="mr-1 h-3 w-3" />,
        },
        CANCELLED: {
          label: "Annulée",
          class: "bg-red-100 text-red-800 border-red-200",
          icon: <X className="mr-1 h-3 w-3" />,
        },
        REFUNDED: {
          label: "Remboursée",
          class: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <RefreshCcw className="mr-1 h-3 w-3" />,
        },
      }

      const config = statusConfig[status] || {
        label: status,
        class: "bg-gray-100 text-gray-800 border-gray-200",
        icon: null,
      }

      return (
        <div className="text-center">
          <Badge variant="outline" className={`font-medium ${config.class}`}>
            {config.icon}
            {config.label}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/dashboard/orders/${row.original.id_order}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Voir</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Voir les détails</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/dashboard/orders/${row.original.id_order}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <PencilLine className="h-4 w-4" />
                  <span className="sr-only">Modifier</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Modifier la commande</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={row.original.invoice_pdf_url || "#"}
                target="_blank"
                onClick={e =>
                  !row.original.invoice_pdf_url && e.preventDefault()
                }
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!row.original.invoice_pdf_url}
                >
                  <Receipt className="h-4 w-4" />
                  <span className="sr-only">Facture</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              {row.original.invoice_pdf_url
                ? "Voir la facture"
                : "Facture non disponible"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    ),
    enableHiding: false,
  },
]

export const ordersColumnNamesInFrench: Record<string, string> = {
  id_order: "N° Commande",
  order_date: "Date",
  user: "Client",
  total_amount: "Montant",
  order_items: "Articles",
  payment_method: "Paiement",
  order_status: "Status",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher sur plusieurs colonnes
export const globalFilterFunction = (
  row: any,
  columnId: string,
  filterValue: string
): boolean => {
  const searchTerm = filterValue.toLowerCase()

  // Recherche dans le numéro de commande
  if (
    row.getValue("id_order") &&
    String(row.getValue("id_order")).includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans le nom du client ou email
  const user = row.getValue("user") as OrderWithItems["user"]
  if (user) {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase()
    const email = user.email.toLowerCase()
    if (fullName.includes(searchTerm) || email.includes(searchTerm)) {
      return true
    }
  }

  // Recherche dans la méthode de paiement
  if (
    row.getValue("payment_method") &&
    String(row.getValue("payment_method")).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans le numéro de facture
  if (
    row.original.invoice_number &&
    row.original.invoice_number.toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  return false
}
