import { useState, useEffect, useCallback } from "react"
import { ContactMessage } from "@/components/Admin/ContactMessages/ContactMessageColumns"
import { useToast } from "@/hooks/use-toast"

// Type pour les statistiques des messages
type ContactMessageStats = {
  total: number
  unread: number
  unanswered: number
  lastWeek: number
}

export function useContactMessagesData() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tous")
  const [stats, setStats] = useState<ContactMessageStats>({
    total: 0,
    unread: 0,
    unanswered: 0,
    lastWeek: 0,
  })
  const { toast } = useToast()

  // Fonction pour récupérer les messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contact-message`)

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: ContactMessage[] = await response.json()
      setMessages(data)
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchMessages:", error)
      setError("Erreur lors du chargement des messages")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/contact-message/stats")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setStats(data)
    } catch (error: unknown) {
      console.error("Erreur fetchStats:", error)
    }
  }, [])

  // Fonction pour supprimer des messages
  const deleteMessages = async (messageIds: number[]) => {
    try {
      for (const id of messageIds) {
        const response = await fetch(`/api/contact-message/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error deleting message ${id}`)
        }
      }

      // Recharger les messages après suppression
      await fetchMessages()
      await fetchStats()

      toast({
        title: "Messages supprimés",
        variant: "success",
        description: `${messageIds.length} message(s) supprimé(s)`,
      })

      return true
    } catch (error: unknown) {
      console.error("Erreur deleteMessages:", error)

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer les messages sélectionnés",
      })

      throw error
    }
  }

  // Charger les messages lors du montage du composant
  useEffect(() => {
    fetchMessages()
    fetchStats()
  }, [fetchMessages, fetchStats])

  return {
    messages,
    loading,
    error,
    setError,
    fetchMessages,
    fetchStats,
    deleteMessages,
    activeTab,
    setActiveTab,
    stats,
  }
}
