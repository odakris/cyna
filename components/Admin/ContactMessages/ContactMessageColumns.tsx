import * as React from "react"
import { ColumnDef, Row } from "@tanstack/react-table"
import {
  ArrowUpDown,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Clock,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import ActionsCell from "@/components/Admin/ActionCell"

// Type pour les messages de contact
export interface ContactMessage {
  id_message: number
  email: string
  subject: string
  message: string
  sent_date: string | Date
  is_read: boolean
  is_responded: boolean
  response?: string | null
  response_date?: string | Date | null
  id_user: number | null
  user?: {
    email: string
    firstname: string | null
    lastname: string | null
  } | null
}

// Fonction pour formater la date
const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Fonction pour tronquer le texte
const truncateText = (text: string, maxLength = 50) => {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

export const ContactMessageColumns: ColumnDef<ContactMessage>[] = [
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
    accessorKey: "is_read",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const isRead = row.getValue("is_read") as boolean
      const isResponded = row.original.is_responded

      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {isResponded ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      <CheckCircle className="mr-1 h-3 w-3 text-green-600" />{" "}
                      Répondu
                    </Badge>
                  ) : isRead ? (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800"
                    >
                      <CheckCircle className="mr-1 h-3 w-3 text-gray-600" /> Lu
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800"
                    >
                      <XCircle className="mr-1 h-3 w-3 text-blue-600" /> Non lu
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isResponded
                  ? "Message répondu"
                  : isRead
                    ? "Message lu"
                    : "Message non lu"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      if (value === "all") return true
      if (value === "responded") return row.original.is_responded
      const isRead = row.getValue(id) as boolean
      if (value === "read") return isRead && !row.original.is_responded
      if (value === "unread") return !isRead
      return true
    },
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
          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
          Expéditeur
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      const user = row.original.user

      return (
        <div className="flex items-start gap-2">
          {/* <Mail className="h-4 w-4 text-muted-foreground mt-1" /> */}
          <div className="flex flex-col w-full">
            {user?.firstname && user?.lastname ? (
              <>
                <span className="font-medium">
                  {user.firstname} {user.lastname}
                </span>
                <span className="text-sm text-muted-foreground">{email}</span>
              </>
            ) : (
              <span className="font-medium">{email}</span>
            )}
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "subject",
    header: ({ column }) => (
      <div className="flex justify-center items-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Sujet
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const subject = row.getValue("subject") as string
      const message = row.original.message

      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center",
            !row.original.is_read ? "font-medium" : ""
          )}
        >
          <div className="text-base">{subject}</div>
          <div className="text-sm text-muted-foreground text-center">
            {truncateText(message, 60)}
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "sent_date",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          Date d&apos;envoi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const sentDate = row.getValue("sent_date") as string

      return (
        <div className="flex justify-center items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(sentDate)}</span>
        </div>
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
          { type: "reply", tooltip: "Répondre" },
        ]}
        basePath="/dashboard/contact"
        entityId={row.original.id_message}
        externalBasePath="/contact"
      />
    ),
    enableHiding: false,
  },
]

export const contactMessageColumnNamesInFrench: Record<string, string> = {
  is_read: "Statut",
  email: "Expéditeur",
  subject: "Sujet",
  sent_date: "Date d'envoi",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher dans les messages
export const globalFilterFunction = (
  row: Row<ContactMessage>,
  columnId: string,
  filterValue: string
): boolean => {
  const searchTerm = filterValue.toLowerCase()

  // Recherche dans le sujet
  if (
    row.original.subject &&
    String(row.original.subject).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans l'email
  if (
    row.original.email &&
    String(row.original.email).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans le message
  if (
    row.original.message &&
    String(row.original.message).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans la réponse
  if (
    row.original.response &&
    String(row.original.response).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans le nom/prénom si utilisateur
  if (
    row.original.user?.firstname &&
    String(row.original.user.firstname).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  if (
    row.original.user?.lastname &&
    String(row.original.user.lastname).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  return false
}
