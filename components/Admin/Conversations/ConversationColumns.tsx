import * as React from "react"
import { ColumnDef, Row } from "@tanstack/react-table"
import {
  ArrowUpDown,
  Calendar,
  // CheckCircle,
  // XCircle,
  // MessageSquare,
  Clock,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip"
import ActionsCell from "@/components/Admin/ActionCell"
// import { ConversationStatus, MessageType } from "@prisma/client"
import { MessageType } from "@prisma/client"

// Type pour les conversations
export interface Conversation {
  id_conversation: number
  // status: ConversationStatus
  created_at: string | Date
  updated_at: string | Date
  email: string | null
  id_user: number | null
  user: {
    email: string
    first_name: string
    last_name: string
  } | null
  messages: {
    id_message: number
    content: string
    message_type: MessageType
    created_at: string | Date
  }[]
}

// Fonction pour formater la date
export const formatDate = (dateString: string | Date) => {
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
export const truncateText = (text: string, maxLength = 50) => {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

// Fonction pour obtenir le dernier message d'une conversation
export const getLastMessage = (conversation: Conversation) => {
  if (conversation.messages && conversation.messages.length > 0) {
    const message = conversation.messages[0]
    return {
      content:
        message.content.length > 50
          ? message.content.substring(0, 50) + "..."
          : message.content,
      type: message.message_type,
    }
  }
  return { content: "Pas de message", type: MessageType.BOT }
}

// Fonction pour rendre le badge de statut
// export const renderStatusBadge = (status: ConversationStatus) => {
//   switch (status) {
//     case ConversationStatus.ACTIVE:
//       return (
//         <Badge variant="outline" className="bg-green-100 text-green-800">
//           <CheckCircle className="mr-1 h-3 w-3 text-green-600" /> Actif
//         </Badge>
//       )
//     case ConversationStatus.PENDING_ADMIN:
//       return (
//         <Badge className="bg-amber-500">
//           <Clock className="mr-1 h-3 w-3" /> En attente
//         </Badge>
//       )
//     case ConversationStatus.CLOSED:
//       return (
//         <Badge variant="outline" className="bg-slate-100 text-slate-800">
//           <XCircle className="mr-1 h-3 w-3 text-slate-600" /> Fermé
//         </Badge>
//       )
//     default:
//       return <Badge variant="outline">{status}</Badge>
//   }
// }

export const ConversationColumns: ColumnDef<Conversation>[] = [
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
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <div className="text-center">
  //       <Button
  //         variant="ghost"
  //         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //         className="px-2"
  //       >
  //         <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
  //         Statut
  //         <ArrowUpDown className="ml-2 h-4 w-4" />
  //       </Button>
  //     </div>
  //   ),
  //   cell: ({ row }) => {
  //     const status = row.getValue("status") as ConversationStatus

  //     return (
  //       <div className="flex justify-center">
  //         <TooltipProvider>
  //           <Tooltip>
  //             <TooltipTrigger asChild>
  //               <div>{renderStatusBadge(status)}</div>
  //             </TooltipTrigger>
  //             <TooltipContent>
  //               {status === ConversationStatus.ACTIVE
  //                 ? "Conversation active"
  //                 : status === ConversationStatus.PENDING_ADMIN
  //                   ? "En attente d'un conseiller"
  //                   : "Conversation fermée"}
  //             </TooltipContent>
  //           </Tooltip>
  //         </TooltipProvider>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     if (value === "all") return true
  //     return row.getValue(id) === value
  //   },
  //   enableSorting: true,
  // },
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
      const conversation = row.original
      const email = conversation.email || conversation.user?.email || "Anonyme"

      return (
        <div className="flex gap-2">
          <div className="flex flex-col w-full">
            {conversation.user?.first_name && conversation.user?.last_name ? (
              <>
                <span className="font-medium">
                  {conversation.user.first_name} {conversation.user.last_name}
                </span>
                <span className="text-sm text-muted-foreground">{email}</span>
              </>
            ) : (
              <>
                <span className="font-medium">Client anonyme</span>
                <span className="text-sm text-muted-foreground">{email}</span>
              </>
            )}
          </div>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "messages",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          Dernier message
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const conversation = row.original
      const lastMessage = getLastMessage(conversation)

      return (
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {lastMessage.type === MessageType.USER
              ? "Client"
              : lastMessage.type === MessageType.ADMIN
                ? "Admin"
                : "Bot"}
          </Badge>
          <span className="text-sm truncate w-full">{lastMessage.content}</span>
        </div>
      )
    },
    enableSorting: false,
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
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          Création
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const created_at = row.getValue("created_at") as string

      return (
        <div className="flex justify-center items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(created_at)}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
          Mise à jour
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const updated_at = row.getValue("updated_at") as string

      return (
        <div className="flex justify-center items-center gap-2 text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(updated_at)}</span>
        </div>
      )
    },
    enableSorting: true,
  },
  // {
  //   id: "actions",
  //   header: "Actions",
  //   cell: ({ row }) => (
  //     <ActionsCell
  //       actions={[
  //         { type: "view", tooltip: "Voir les détails" },
  //         {
  //           type: "custom",
  //           tooltip: "Modifier le statut",
  //           icon: <Clock className="h-4 w-4" />,
  //           href: `/dashboard/conversations/${row.original.id_conversation}#status`,
  //         },
  //       ]}
  //       basePath="/dashboard/conversations"
  //       entityId={row.original.id_conversation}
  //       onDelete={id => console.log(`Suppression de la conversation ${id}`)}
  //     />
  //   ),
  //   enableHiding: false,
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionsCell
        actions={[{ type: "view", tooltip: "Voir les détails" }]}
        basePath="/dashboard/conversations"
        entityId={row.original.id_conversation}
      />
    ),
    enableHiding: false,
  },
]

export const conversationColumnNamesInFrench: Record<string, string> = {
  // status: "Statut",
  user: "Client",
  messages: "Dernier message",
  created_at: "Création",
  updated_at: "Mise à jour",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher dans les conversations
export const globalFilterFunction = (
  row: Row<Conversation>,
  columnId: string,
  filterValue: string
): boolean => {
  const searchTerm = filterValue.toLowerCase()

  // Recherche dans l'email
  if (
    row.original.email &&
    String(row.original.email).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans les informations utilisateur
  if (
    row.original.user?.email &&
    String(row.original.user.email).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  if (
    row.original.user?.first_name &&
    String(row.original.user.first_name).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  if (
    row.original.user?.last_name &&
    String(row.original.user.last_name).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans les messages
  if (row.original.messages && row.original.messages.length > 0) {
    for (const message of row.original.messages) {
      if (
        message.content &&
        String(message.content).toLowerCase().includes(searchTerm)
      ) {
        return true
      }
    }
  }

  return false
}
