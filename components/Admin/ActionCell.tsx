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
    | "download_receipt"
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
    download_receipt: <Receipt className="h-4 w-4" />,
  }

  // Mapping des types d'actions vers leurs permissions par défaut
  const defaultPermissions = (section: string) => ({
    view: `${section}:view` as Permission,
    edit: `${section}:edit` as Permission,
    delete: `${section}:delete` as Permission,
    reply: `${section}:respond` as Permission,
    download_receipt: `${section}:view` as Permission,
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

    // Vérifier si invoicePdfUrl existe pour les actions receipt et download_receipt
    if (
      action.type === "download_receipt" &&
      (!invoicePdfUrl || invoicePdfUrl === "#")
    ) {
      return false
    }

    return true
  }

  // Gestion du téléchargement de la facture
  const handleDownloadReceipt = async () => {
    if (!invoicePdfUrl) return

    try {
      const response = await fetch(invoicePdfUrl)
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Accès non autorisé à la facture")
        }
        throw new Error("Erreur lors de la récupération de la facture")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `facture-${entityId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erreur lors du téléchargement de la facture :", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Impossible de télécharger la facture. Veuillez réessayer plus tard."
      alert(errorMessage)
    }
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
      case "download_receipt":
        return "#" // Pas d'URL directe, géré par handleDownloadReceipt
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
      case "download_receipt":
        return "Télécharger la facture"
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
                  <span className="sr-only">{getTooltipContent(action)}</span>
                </Button>
              ) : action.type === "download_receipt" ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDownloadReceipt}
                >
                  {getActionIcon(action)}
                  <span className="sr-only">{getTooltipContent(action)}</span>
                </Button>
              ) : (
                <Link
                  href={getActionUrl(action)}
                  target={action.type === "external" ? "_blank" : undefined}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {getActionIcon(action)}
                    <span className="sr-only">{getTooltipContent(action)}</span>
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
