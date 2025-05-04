"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface MainMessageBackgroundSwitchProps {
  messageId: number
  initialHasBackground: boolean
  onBackgroundChange?: (newStatus: boolean) => void
}

export default function MainMessageBackgroundSwitch({
  messageId,
  initialHasBackground,
  onBackgroundChange,
}: MainMessageBackgroundSwitchProps) {
  const [hasBackground, setHasBackground] = useState(initialHasBackground)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleBackgroundStatus = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/main-message/${messageId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ has_background: !hasBackground }),
      })

      if (!response.ok) throw new Error("Échec de la mise à jour")

      // Mettre à jour l'état local avec le nouveau statut
      setHasBackground(!hasBackground)

      // Appeler le callback si fourni
      if (onBackgroundChange) {
        onBackgroundChange(!hasBackground)
      }

      toast({
        title: !hasBackground
          ? "Arrière-plan activé"
          : "Arrière-plan désactivé",
        description: `Le statut de l'arrière-plan a été mis à jour avec succès.`,
        variant: !hasBackground ? "success" : "destructive",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'arrière-plan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Switch
      checked={hasBackground}
      onCheckedChange={toggleBackgroundStatus}
      disabled={isLoading}
    />
  )
}
