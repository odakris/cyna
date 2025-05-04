"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

interface ProductActiveSwitchProps {
  productId: number
  initialActive: boolean
  onStatusChange?: (newStatus: boolean) => void
}

export default function ProductActiveSwitch({
  productId,
  initialActive,
  onStatusChange,
}: ProductActiveSwitchProps) {
  const [active, setActive] = useState(initialActive)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleStatus = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/products/${productId}/active`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
      })

      const data = await response.json()

      // Vérifier si l'activation a été bloquée
      if (data.blocked) {
        // La catégorie est inactive, donc on ne peut pas activer le produit
        toast({
          title: "Activation impossible",
          description:
            data.reason || "La catégorie de ce produit est inactive.",
          variant: "destructive",
        })

        // Ne pas mettre à jour l'état local
        return
      }

      if (!response.ok) throw new Error("Échec de la mise à jour")

      // Mettre à jour l'état local avec le nouveau statut
      setActive(data.active)

      // Appeler le callback si fourni
      if (onStatusChange) {
        onStatusChange(data.active)
      }

      toast({
        title: data.active ? "Produit activé" : "Produit désactivé",
        variant: data.active ? "success" : "destructive",
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
