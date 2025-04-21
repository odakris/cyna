import * as React from "react"
import { ColumnDef, Row } from "@tanstack/react-table"
import { ArrowUpDown, CheckCircle2, XCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { User } from "@prisma/client"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import ActionsCell from "@/components/Admin/ActionCell"

export const usersColumns: ColumnDef<User>[] = [
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
    id: "user",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Utilisateur
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const firstName = row.getValue("first_name") as string
      const lastName = row.getValue("last_name") as string
      const email = row.getValue("email") as string

      const initials =
        `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()

      return (
        <div className="flex items-center space-x-3 pl-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-left">
            <div className="font-medium">
              {firstName} {lastName}
            </div>
            <div className="text-xs text-muted-foreground truncate max-w-[180px]">
              {email}
            </div>
          </div>
        </div>
      )
    },
    sortingFn: (rowA, rowB) => {
      const firstNameA = rowA.getValue("first_name") as string
      const lastNameA = rowA.getValue("last_name") as string
      const firstNameB = rowB.getValue("first_name") as string
      const lastNameB = rowB.getValue("last_name") as string

      const fullNameA = `${firstNameA} ${lastNameA}`
      const fullNameB = `${firstNameB} ${lastNameB}`

      return fullNameA.localeCompare(fullNameB)
    },
    accessorFn: row => `${row.first_name} ${row.last_name}`,
  },
  {
    accessorKey: "first_name",
    header: "Prénom",
    enableSorting: true,
    enableHiding: true,
    size: 0,
    meta: {
      hidden: true,
    },
  },
  {
    accessorKey: "last_name",
    header: "Nom",
    enableSorting: true,
    enableHiding: true,
    size: 0,
    meta: {
      hidden: true,
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    enableHiding: true,
    size: 0,
    meta: {
      hidden: true,
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Rôle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string

      // Utilisons des classes Tailwind personnalisées pour des couleurs plus vives
      let badgeClass = ""

      switch (role) {
        case "SUPER_ADMIN":
          badgeClass = "bg-purple-100 text-purple-800 hover:bg-purple-200"
          break
        case "ADMIN":
          badgeClass = "bg-red-100 text-red-800 hover:bg-red-200"
          break
        case "MANAGER":
          badgeClass = "bg-blue-100 text-blue-800 hover:bg-blue-200"
          break
        case "CUSTOMER":
          badgeClass = "bg-green-100 text-green-800 hover:bg-green-200"
          break
      }

      return (
        <div className="text-center">
          <Badge
            variant="outline"
            className={`capitalize font-semibold px-3 py-1 ${badgeClass}`}
          >
            {role.toLowerCase().replace("_", " ")}
          </Badge>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "email_verified",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Email vérifié
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const verified = row.getValue("email_verified") as boolean
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center">
                {verified ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mx-auto" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {verified ? "Email vérifié" : "Email en attente de vérification"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Inscription
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as Date
      const formattedDate = date
        ? new Date(date).toLocaleDateString("fr-FR")
        : "-"

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center flex items-center justify-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formattedDate}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {date ? new Date(date).toLocaleString("fr-FR") : "Date inconnue"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        actions={[
          { type: "view", tooltip: "Voir les détails" },
          { type: "edit", tooltip: "Modifier l'utilisateur'" },
        ]}
        basePath="/dashboard/users"
        entityId={row.original.id_user}
        externalBasePath="/users"
      />
    ),
    enableHiding: false,
  },
]

export const usersColumnNamesInFrench: Record<string, string> = {
  user: "Utilisateur",
  first_name: "Prénom",
  last_name: "Nom",
  email: "Email",
  role: "Rôle",
  email_verified: "Vérification Email",
  created_at: "Date d'inscription",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher sur plusieurs colonnes
export const globalFilterFunction = (
  row: Row<User>,
  columnId: string,
  filterValue: string
): boolean => {
  const searchTerm = filterValue.toLowerCase()

  // Recherche dans le prénom
  if (
    row.getValue("first_name") &&
    String(row.getValue("first_name")).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans le nom
  if (
    row.getValue("last_name") &&
    String(row.getValue("last_name")).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans l'email
  if (
    row.getValue("email") &&
    String(row.getValue("email")).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans le rôle
  if (
    row.getValue("role") &&
    String(row.getValue("role")).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  return false
}
