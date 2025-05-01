import { useState, useEffect, useCallback } from "react"
import { OrderWithItems } from "@/types/Types"
import { OrderStatus } from "@prisma/client"

// Type pour les statistiques des commandes
type OrderStats = {
  total: number
  pending: number
  processing: number
  active: number
  completed: number
  cancelled: number
  refunded: number
  today: number
  totalRevenue: number
}

export function useOrdersData() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    processing: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
    today: 0,
    totalRevenue: 0,
  })

  // Fonction pour récupérer les commandes
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/orders")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setOrders(data.orders || [])

      // Calculer les statistiques
      if (data.orders && data.orders.length > 0) {
        const newStats: OrderStats = {
          total: data.orders.length,
          pending: data.orders.filter(
            (o: OrderWithItems) => o.order_status === OrderStatus.PENDING
          ).length,
          processing: data.orders.filter(
            (o: OrderWithItems) => o.order_status === OrderStatus.PROCESSING
          ).length,
          active: data.orders.filter(
            (o: OrderWithItems) => o.order_status === OrderStatus.ACTIVE
          ).length,
          completed: data.orders.filter(
            (o: OrderWithItems) => o.order_status === OrderStatus.COMPLETED
          ).length,
          cancelled: data.orders.filter(
            (o: OrderWithItems) => o.order_status === OrderStatus.CANCELLED
          ).length,
          refunded: data.orders.filter(
            (o: OrderWithItems) => o.order_status === OrderStatus.REFUNDED
          ).length,
          today: data.orders.filter((o: OrderWithItems) =>
            isToday(new Date(o.order_date))
          ).length,
          totalRevenue: data.orders.reduce(
            (sum: number, order: OrderWithItems) => sum + order.total_amount,
            0
          ),
        }
        setStats(newStats)
      }

      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchOrders:", error)
      setError("Erreur lors du chargement des commandes")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour supprimer des commandes
  const deleteOrders = async (orderIds: number[]) => {
    try {
      for (const id of orderIds) {
        const response = await fetch(`/api/orders/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error deleting order ${id}`)
        }
      }

      // Recharger les commandes après suppression
      await fetchOrders()
      return true
    } catch (error: unknown) {
      console.error("Erreur deleteOrders:", error)
      throw error
    }
  }

  // Fonction pour vérifier si une date est aujourd'hui
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Charger les commandes lors du montage du composant
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    deleteOrders,
    activeTab,
    setActiveTab,
    stats,
  }
}
