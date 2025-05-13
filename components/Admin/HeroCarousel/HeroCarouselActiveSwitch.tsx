"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface HeroCarouselActiveSwitchProps {
  slideId: number
  initialActive: boolean
  onStatusChange?: (newStatus: boolean) => void
}

export default function HeroCarouselActiveSwitch({
  slideId,
  initialActive,
  onStatusChange,
}: HeroCarouselActiveSwitchProps) {
  const [active, setActive] = useState(initialActive)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleStatus = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/hero-carousel/${slideId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !active }),
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }

      const updatedSlide = await response.json()

      // Mettre à jour l'état local avec le nouveau statut
      setActive(updatedSlide.active)

      // Appeler le callback si fourni
      if (onStatusChange) {
        onStatusChange(updatedSlide.active)
      }

      toast({
        title: updatedSlide.active ? "Slide activé" : "Slide désactivé",
        variant: updatedSlide.active ? "success" : "destructive",
        description: "Le statut a été mis à jour avec succès.",
      })
    } catch (error) {
      // console.error("Erreur lors du changement de statut:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut du slide",
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
      aria-label={active ? "Désactiver" : "Activer"}
    />
  )
}
