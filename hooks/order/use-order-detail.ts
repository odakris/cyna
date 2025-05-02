import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { OrderWithItems } from "@/types/Types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function useOrderDetail(orderId: string) {
  const { toast } = useToast()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Récupérer les détails de la commande
  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${orderId}`)

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setOrder(data.order)
      setError(null)
    } catch (error) {
      console.error("Erreur lors du chargement de la commande:", error)
      setError("Impossible de charger les détails de la commande")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Charger les détails au montage du composant
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId, fetchOrderDetails])

  // Mettre à jour le statut de la commande
  const handleUpdateStatus = async () => {
    if (!updateStatus || !order) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_status: updateStatus,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Erreur HTTP ${response.status}: ${errorData.details || response.statusText}`
        )
      }

      const data = await response.json()
      setOrder(data.order)
      toast({
        title: "Statut mis à jour",
        description: `La commande est maintenant ${getStatusLabel(updateStatus)}`,
      })
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour le statut de la commande",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
      setUpdateStatus(null)
    }
  }

  // Fonctions utilitaires
  const formatDate = (date: string) => {
    return format(new Date(date), "dd MMMM yyyy à HH:mm", { locale: fr })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  // Obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    const statusConfig: Record<string, string> = {
      PENDING: "En attente",
      PROCESSING: "En traitement",
      ACTIVE: "Active",
      PAID: "Payée",
      COMPLETED: "Terminée",
      CANCELLED: "Annulée",
      REFUNDED: "Remboursée",
    }
    return statusConfig[status] || status
  }

  // Calculer le total des quantités
  const getTotalQuantity = () => {
    if (!order) return 0
    return order.order_items.reduce((acc, item) => acc + item.quantity, 0)
  }

  return {
    order,
    loading,
    error,
    updateStatus,
    setUpdateStatus,
    updating,
    handleUpdateStatus,
    formatDate,
    formatPrice,
    getTotalQuantity,
    getStatusLabel,
  }
}
