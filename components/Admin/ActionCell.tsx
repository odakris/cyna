"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Eye,
  PencilLine,
  ExternalLink,
  Trash2,
  Reply,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { hasPermission } from "@/lib/permissions"
import { Role } from "@prisma/client"
import { Permission } from "@/lib/permissions"

export interface ActionConfig {
  type:
    | "view"
    | "edit"
    | "delete"
    | "external"
    | "external_main"
    | "reply"
    | "receipt"
    | "custom"
  href?: string
  externalPath?: string
  onClick?: () => void
  tooltip: string
  icon?: React.ReactNode
  permission?: Permission
  id?: number | string
}

interface ActionsCellProps {
  actions: ActionConfig[]
  basePath: string // Par exemple: '/dashboard/products'
  entityId: number | string // ID de l'entité (produit, catégorie, etc.)
  showExternal?: boolean // Afficher ou non le lien externe
  externalBasePath?: string // Par exemple: '/produit'
  invoicePdfUrl?: string // URL de la facture PDF
  onDelete?: (id: number | string) => void
}

const ActionsCell = ({
  actions,
  basePath,
  entityId,
  externalBasePath,
  invoicePdfUrl,
  onDelete,
}: ActionsCellProps) => {
  const { data: session } = useSession()
  const userRole = session?.user?.role as Role | undefined

  // Mapping des types d'actions vers leurs icônes par défaut
  const defaultIcons = {
    view: <Eye className="h-4 w-4" />,
    edit: <PencilLine className="h-4 w-4" />,
    delete: <Trash2 className="h-4 w-4" />,
    reply: <Reply className="h-4 w-4" />,
    external: <ExternalLink className="h-4 w-4" />,
    external_main: <ExternalLink className="h-4 w-4" />,
    receipt: <Receipt className="h-4 w-4" />,
  }

  // Mapping des types d'actions vers leurs permissions par défaut
  const defaultPermissions = (section: string) => ({
    view: `${section}:view` as Permission,
    edit: `${section}:edit` as Permission,
    delete: `${section}:delete` as Permission,
    reply: `${section}:respond` as Permission,
    receipt: `${section}:view` as Permission,
    external: undefined, // Pas de permission requise pour voir sur le site
    external_main: undefined, // Pas de permission requise pour voir sur le site
    custom: undefined,
  })

  // Extraire la section du basePath (ex: 'products' de '/dashboard/products')
  const section = basePath.split("/").pop() || ""

  // Fonction pour vérifier si une action devrait être rendue
  const shouldRenderAction = (action: ActionConfig): boolean => {
    // Si une permission est spécifiée, vérifier si l'utilisateur l'a
    if (action.permission && !hasPermission(userRole, action.permission)) {
      return false
    }

    // Sinon, vérifier la permission par défaut basée sur le type
    const defaultPermission = defaultPermissions(section)[action.type]
    if (defaultPermission && !hasPermission(userRole, defaultPermission)) {
      return false
    }

    return true
  }

  // Générer l'URL en fonction du type d'action
  const getActionUrl = (action: ActionConfig): string => {
    if (action.href) {
      return action.href
    }

    switch (action.type) {
      case "view":
        return `${basePath}/${entityId}`
      case "edit":
        return `${basePath}/${entityId}/edit`
      case "external":
        return `${externalBasePath || `/${section.slice(0, -1)}`}/${entityId}`
      case "external_main":
        return `/`
      case "reply":
        return `${basePath}/${entityId}/respond`
      case "receipt":
        return `${invoicePdfUrl}`
      default:
        return "#"
    }
  }

  // Générer le contenu du tooltip
  const getTooltipContent = (action: ActionConfig): string => {
    if (action.tooltip) {
      return action.tooltip
    }

    switch (action.type) {
      case "view":
        return "Voir les détails"
      case "edit":
        return "Modifier"
      case "delete":
        return "Supprimer"
      case "external":
        return "Voir sur le site"
      case "external_main":
        return "Voir sur le site"
      case "reply":
        return "Répondre"
      case "receipt":
        return "Voir la facture"
      default:
        return ""
    }
  }

  // Générer l'icône
  const getActionIcon = (action: ActionConfig): React.ReactNode => {
    if (action.icon) {
      return action.icon
    }

    return (
      defaultIcons[action.type as keyof typeof defaultIcons] || (
        <Eye className="h-4 w-4" />
      )
    )
  }

  return (
    <div className="flex justify-center space-x-2">
      {actions.filter(shouldRenderAction).map((action, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              {action.type === "delete" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDelete && onDelete(action.id || entityId)}
                >
                  {getActionIcon(action)}
                  <span className="sr-only">{action.tooltip}</span>
                </Button>
              ) : (
                <Link
                  href={getActionUrl(action)}
                  target={action.type === "external" ? "_blank" : undefined}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {getActionIcon(action)}
                    <span className="sr-only">{action.tooltip}</span>
                  </Button>
                </Link>
              )}
            </TooltipTrigger>
            <TooltipContent>{getTooltipContent(action)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  )
}

export default ActionsCell
