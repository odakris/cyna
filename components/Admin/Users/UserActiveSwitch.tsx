"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface UserActiveSwitchProps {
  userId: number
  initialActive: boolean
  onStatusChange?: (newStatus: boolean) => void
}

export default function UserActiveSwitch({
  userId,
  initialActive,
  onStatusChange,
}: UserActiveSwitchProps) {
  const [active, setActive] = useState(initialActive)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleStatus = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/users/${userId}/active`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Échec de la mise à jour du statut")
      }

      const data = await response.json()

      // Mettre à jour l'état local avec le nouveau statut
      setActive(data.active)

      // Appeler le callback si fourni
      if (onStatusChange) {
        onStatusChange(data.active)
      }

      toast({
        title: data.active ? "Utilisateur activé" : "Utilisateur désactivé",
        description: `Le statut a été mis à jour avec succès.`,
      })
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
