import * as React from "react"
import { ColumnDef, Row } from "@tanstack/react-table"
import {
  ArrowUpDown,
  MessageCircle,
  SlidersHorizontal,
  Palette,
  Calendar,
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
import { Switch } from "@/components/ui/switch"
import { MainMessage } from "@prisma/client"
import ActionsCell from "@/components/Admin/ActionCell"

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export const mainMessageColumns: ColumnDef<MainMessage>[] = [
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
    id: "message",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <MessageCircle className="mr-2 h-4 w-4 text-muted-foreground" />
          Message
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const message = row.original
      return (
        <div>
          <div
            className={`py-2 px-3 rounded ${
              message.has_background && message.background_color
                ? message.background_color
                : "bg-primary/5"
            }`}
          >
            <p
              className={
                message.text_color ? message.text_color : "text-foreground"
              }
            >
              {message.content.length > 100
                ? `${message.content.substring(0, 100)}...`
                : message.content}
            </p>
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-left">
            ID: #{message.id_main_message}
          </div>
        </div>
      )
    },
    accessorFn: row => row.content,
    enableSorting: true,
  },
  {
    accessorKey: "active",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
          Statut
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean

      return (
        <div className="flex justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    checked={active}
                    onCheckedChange={() => {
                      document.dispatchEvent(
                        new CustomEvent("toggle-message-active", {
                          detail: {
                            id: row.original.id_main_message,
                            currentState: active,
                          },
                        })
                      )
                    }}
                    aria-label={active ? "Désactiver" : "Activer"}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {active ? "Message activé" : "Message désactivé"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const active = row.getValue(id) as boolean
      if (value === undefined) return true
      return value === active
    },
    enableSorting: true,
  },
  {
    accessorKey: "has_background",
    header: ({ column }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="px-2"
        >
          <Palette className="mr-2 h-4 w-4 text-muted-foreground" />
          Arrière-plan
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const hasBackground = row.getValue("has_background") as boolean
      const bgColor = row.original.background_color || ""
      const textColor = row.original.text_color || ""

      return (
        <div className="flex flex-col items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Switch
                    checked={hasBackground}
                    onCheckedChange={() => {
                      document.dispatchEvent(
                        new CustomEvent("toggle-message-background", {
                          detail: {
                            id: row.original.id_main_message,
                            currentState: hasBackground,
                          },
                        })
                      )
                    }}
                    aria-label={
                      hasBackground
                        ? "Désactiver l'arrière-plan"
                        : "Activer l'arrière-plan"
                    }
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {hasBackground
                  ? "Arrière-plan activé"
                  : "Arrière-plan désactivé"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex gap-1">
            {hasBackground && bgColor && (
              <Badge variant="outline" className={cn("text-xs", bgColor)}>
                Fond
              </Badge>
            )}
            {textColor && (
              <Badge variant="outline" className={cn("text-xs", textColor)}>
                Texte
              </Badge>
            )}
          </div>
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
          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
          Mis à jour
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const updatedAt = row.getValue("updated_at") as string
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-center text-muted-foreground text-sm">
                {formatDate(updatedAt)}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dernière mise à jour</p>
              <p className="text-xs">{formatDate(updatedAt)}</p>
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
          { type: "edit", tooltip: "Modifier le message" },
          { type: "external", tooltip: "Voir sur le site" },
        ]}
        basePath="/dashboard/main-message"
        entityId={row.original.id_main_message}
        externalBasePath="/main-message"
      />
    ),
    enableHiding: false,
  },
]

export const mainMessageColumnNamesInFrench: Record<string, string> = {
  message: "Message",
  content: "Contenu",
  active: "Statut",
  has_background: "Arrière-plan",
  updated_at: "Mis à jour",
  actions: "Actions",
}

// Fonction de filtrage global pour rechercher dans les messages
export const globalFilterFunction = (
  row: Row<MainMessage>,
  columnId: string,
  filterValue: string
): boolean => {
  const searchTerm = filterValue.toLowerCase()

  // Recherche dans le contenu du message
  if (
    row.original.content &&
    String(row.original.content).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans l'ID du message
  if (
    row.original.id_main_message &&
    String(row.original.id_main_message).includes(searchTerm)
  ) {
    return true
  }

  // Recherche dans les couleurs
  if (
    row.original.background_color &&
    String(row.original.background_color).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  if (
    row.original.text_color &&
    String(row.original.text_color).toLowerCase().includes(searchTerm)
  ) {
    return true
  }

  return false
}
