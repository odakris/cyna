import { useState, useEffect, useCallback } from "react"
import { Conversation } from "@/components/Admin/Conversations/ConversationColumns"
import { useToast } from "@/hooks/use-toast"
// import { ConversationStatus } from "@prisma/client"

// Type pour les statistiques des conversations
type ConversationStats = {
  total: number
  active: number
  pending: number
  closed: number
  today: number
}

export function useConversationsData() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [stats, setStats] = useState<ConversationStats>({
    total: 0,
    active: 0,
    pending: 0,
    closed: 0,
    today: 0,
  })
  const { toast } = useToast()

  // Fonction pour récupérer les conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/chatbot/conversations`)

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: Conversation[] = await response.json()
      setConversations(data)

      // Calculer les statistiques
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const newStats = {
        total: data.length,
        active: 0,
        pending: 0,
        closed: 0,
        today: data.filter(
          c => new Date(c.created_at).getTime() >= today.getTime()
        ).length,
      }
      setStats(newStats)

      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchConversations:", error)
      setError("Erreur lors du chargement des conversations")

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les conversations",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Fonction pour supprimer des conversations
  const deleteConversations = async (conversationIds: number[]) => {
    try {
      // Confirmer la suppression
      const confirmations = []

      for (const id of conversationIds) {
        const response = await fetch(`/api/chatbot/conversations/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erreur lors de la suppression")
        }

        confirmations.push(response)
      }

      // Recharger les conversations après suppression
      await fetchConversations()

      toast({
        title: "Succès",
        description: `${conversationIds.length} conversation(s) supprimée(s)`,
      })

      return true
    } catch (error: unknown) {
      console.error("Erreur deleteConversations:", error)

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer les conversations sélectionnées",
      })

      throw error
    }
  }

  // Charger les conversations lors du montage du composant
  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    loading,
    error,
    setError,
    fetchConversations,
    deleteConversations,
    activeTab,
    setActiveTab,
    stats,
    showDeleteDialog,
    setShowDeleteDialog,
  }
}
