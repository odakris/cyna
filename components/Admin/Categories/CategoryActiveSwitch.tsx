"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface CategoryActiveSwitchProps {
  categoryId: number
  initialActive: boolean
  onStatusChange?: (newStatus: boolean, productsUpdated: number) => void
}

export default function CategoryActiveSwitch({
  categoryId,
  initialActive,
  onStatusChange,
}: CategoryActiveSwitchProps) {
  const [active, setActive] = useState(initialActive)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const toggleStatus = async () => {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/categories/${categoryId}/active`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
      })

      if (!response.ok) throw new Error("Échec de la mise à jour")

      const data = await response.json()
      setActive(data.active)

      // Appeler le callback si fourni
      if (onStatusChange) {
        onStatusChange(data.active, data.productsUpdated || 0)
      }

      toast({
        title: data.active ? "Catégorie activée" : "Catégorie désactivée",
        variant: data.active ? "success" : "destructive",
        description: data.productsUpdated
          ? `Le statut a été mis à jour avec succès. ${data.productsUpdated} produit(s) ont également été mis à jour.`
          : `Le statut a été mis à jour avec succès.`,
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
      className={cn(
        active
          ? "bg-green-500 data-[state=checked]:bg-green-500"
          : "bg-red-500 data-[state=unchecked]:bg-red-500"
      )}
    />
  )
}
