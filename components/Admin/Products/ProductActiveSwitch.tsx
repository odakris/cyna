"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export default function ProductActiveSwitch({
  productId,
  initialActive,
}: {
  productId: number
  initialActive: boolean
}) {
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

      if (!response.ok) throw new Error("Échec de la mise à jour")

      const data = await response.json()
      setActive(data.active)

      toast({
        title: data.active ? "Produit activé" : "Produit désactivé",
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
