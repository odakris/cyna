"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface MainMessageActiveSwitchProps {
  messageId: number
  active: boolean // Changed from initialActive to active
  toggleMessageActive: (id: number, newStatus: boolean) => Promise<boolean>
  onStatusChange?: (newStatus: boolean) => void
}

export default function MainMessageActiveSwitch({
  messageId,
  active, // Maintenant controlled par le parent
  toggleMessageActive,
  onStatusChange,
}: MainMessageActiveSwitchProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleStatus = async () => {
    try {
      setIsLoading(true)

      // Utiliser la fonction partagée pour modifier le statut
      const success = await toggleMessageActive(messageId, !active)

      if (!success) throw new Error("Échec de la mise à jour")

      // Notification utilisateur
      toast({
        title: !active ? "Message activé" : "Message désactivé",
        variant: !active ? "success" : "destructive",
        description: `Le statut a été mis à jour avec succès.`,
      })

      // Appeler le callback si fourni (pour des effets locaux additionnels)
      if (onStatusChange) {
        onStatusChange(!active)
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Switch
      checked={active}
      onCheckedChange={toggleStatus}
      disabled={isLoading}
    />
  )
}
