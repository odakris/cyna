import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
// import Image from "next/image"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
// import { Badge } from "@/components/ui/badge"
import { User } from "@prisma/client"

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
    accessorKey: "first_name",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Prénom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("first_name")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "last_name",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Nom
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("last_name")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("email")}</div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "password",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Mot de passe
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("password")}</div>
    ),
    enableSorting: true,
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
    cell: ({ row }) => (
      <div className="text-center font-medium">{row.getValue("role")}</div>
    ),
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
          Vérification Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("email_verified")}
      </div>
    ),
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center space-x-2">
        <Link href={`/dashboard/users/${row.original.id_user}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="Voir les détails"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Voir</span>
          </Button>
        </Link>
        <Link href={`/dashboard/users/${row.original.id_user}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="Modifier"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Modifier</span>
          </Button>
        </Link>
      </div>
    ),
    enableHiding: false,
  },
]

export const usersColumnNamesInFrench: Record<string, string> = {
  first_name: "Prénom",
  last_name: "Nom",
  email: "Email",
  password: "Mot de Passe",
  role: "Rôle",
  email_verified: "Vérification Email",
  actions: "Actions",
}
