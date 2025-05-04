import { useState, useEffect, useCallback } from "react"
import { MainMessage } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"

// Type pour les statistiques des messages
type MainMessageStats = {
  total: number
  active: number
  inactive: number
}

export function useMainMessagesData() {
  const [messages, setMessages] = useState<MainMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tous")
  const [stats, setStats] = useState<MainMessageStats>({
    total: 0,
    active: 0,
    inactive: 0,
  })
  const { toast } = useToast()

  // Fonction pour récupérer les messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/main-message")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: MainMessage[] = await response.json()
      setMessages(data)

      // Calculer les statistiques
      const newStats = {
        total: data.length,
        active: data.filter(m => m.active).length,
        inactive: data.filter(m => !m.active).length,
      }
      setStats(newStats)

      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchMessages:", error)
      setError("Erreur lors du chargement des messages")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fonction pour supprimer des messages
  const deleteMessages = async (messageIds: number[]) => {
    try {
      for (const id of messageIds) {
        const response = await fetch(`/api/main-message/${id}`, {
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

      toast({
        title: "Succès",
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

  // Fonction pour activer un message et désactiver les autres
  const toggleMessageActive = async (id: number, newStatus: boolean) => {
    try {
      // Si on active un message, on met à jour tous les messages localement
      // pour que tous les switchs reflètent correctement l'état
      if (newStatus) {
        // Mettre à jour l'état local immédiatement (optimistic update)
        setMessages(prevMessages =>
          prevMessages.map(message => ({
            ...message,
            active: message.id_main_message === id ? true : false,
          }))
        )

        // Mettre à jour les stats également
        setStats(prev => ({
          ...prev,
          active: 1,
          inactive: prev.total - 1,
        }))
      } else {
        // Si on désactive juste un message
        setMessages(prevMessages =>
          prevMessages.map(message => ({
            ...message,
            active: message.id_main_message === id ? false : message.active,
          }))
        )

        // Mettre à jour les stats
        setStats(prev => ({
          ...prev,
          active: prev.active - 1,
          inactive: prev.inactive + 1,
        }))
      }

      // Faire la requête API pour mettre à jour le serveur
      const response = await fetch(`/api/main-message/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: newStatus }),
      })

      if (!response.ok) throw new Error("Échec de la mise à jour")

      // Si la requête réussit, on a déjà mis à jour localement
      // Mais on pourrait rafraîchir les données pour être sûr
      // await fetchMessages();

      return true
    } catch (error) {
      console.error("Erreur toggleMessageActive:", error)

      // En cas d'erreur, on recharge les données pour revenir à l'état correct
      await fetchMessages()

      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du message",
        variant: "destructive",
      })

      return false
    }
  }

  // Charger les messages lors du montage du composant
  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    setError,
    fetchMessages,
    deleteMessages,
    toggleMessageActive,
    activeTab,
    setActiveTab,
    stats,
  }
}
