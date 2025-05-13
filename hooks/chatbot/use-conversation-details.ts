import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { MessageType, ConversationStatus } from "@prisma/client"

// Types pour les messages et les conversations
interface Message {
  id_message: number
  content: string
  message_type: MessageType
  created_at: string | Date
}

interface Conversation {
  id_conversation: number
  status: ConversationStatus
  created_at: string | Date
  updated_at: string | Date
  email: string | null
  id_user: number | null
  user: {
    email: string
    first_name: string
    last_name: string
  } | null
}

interface ConversationWithMessages extends Conversation {
  messages: Message[]
}

export function useConversationDetails(conversationId: string) {
  const [conversation, setConversation] =
    useState<ConversationWithMessages | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState<string>("")
  const [sending, setSending] = useState<boolean>(false)
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false)
  const [updateStatus, setUpdateStatus] = useState<ConversationStatus | null>(
    null
  )

  const { toast } = useToast()
  const router = useRouter()

  // Fonction pour récupérer les détails de la conversation
  const fetchConversation = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/chatbot/conversations/${conversationId}`
      )

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data = await response.json()
      setConversation(data.conversation)
      setMessages(data.messages)
      setError(null)
    } catch (error: unknown) {
      // console.error("Erreur fetchConversation:", error)
      setError("Erreur lors du chargement de la conversation")

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les détails de la conversation",
      })
    } finally {
      setLoading(false)
    }
  }, [conversationId, toast])

  // Fonction pour mettre à jour le statut de la conversation
  const updateConversationStatus = async (status: ConversationStatus) => {
    if (!conversation) return

    try {
      setStatusUpdating(true)

      const response = await fetch(
        `/api/chatbot/conversations/${conversation.id_conversation}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut")
      }

      const updatedConversation = await response.json()
      setConversation({
        ...updatedConversation,
        messages: conversation.messages,
      })

      toast({
        title: "Statut mis à jour",
        variant: "success",
        description: `La conversation est maintenant ${
          status === ConversationStatus.ACTIVE
            ? "active"
            : status === ConversationStatus.CLOSED
              ? "fermée"
              : "en attente"
        }`,
      })

      setUpdateStatus(null)
    } catch (error) {
      // console.error("Erreur updateConversationStatus:", error)

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
      })
    } finally {
      setStatusUpdating(false)
    }
  }

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (!input.trim() || !conversation) return

    try {
      setSending(true)
      const response = await fetch("/api/chatbot/messages/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: input,
          conversationId: conversation.id_conversation,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi du message")
      }

      const data = await response.json()

      // Ajouter le nouveau message à la liste
      setMessages(prev => [
        ...prev,
        {
          id_message: data.message.id_message,
          content: data.message.content,
          message_type: data.message.message_type,
          created_at: data.message.created_at,
        },
      ])

      // Effacer le champ de saisie
      setInput("")

      // Mettre à jour le statut de la conversation si c'était PENDING_ADMIN
      if (conversation.status === ConversationStatus.PENDING_ADMIN) {
        setConversation({
          ...conversation,
          status: ConversationStatus.ACTIVE,
        })
      }

      toast({
        variant: "success",
        title: "Message envoyé",
        description: "Votre réponse a été envoyée avec succès",
      })
    } catch (error) {
      // console.error("Erreur handleSendMessage:", error)

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le message",
      })
    } finally {
      setSending(false)
    }
  }

  // Fonction pour supprimer la conversation
  const handleDelete = async () => {
    if (!conversation) return

    try {
      const response = await fetch(
        `/api/chatbot/conversations/${conversation.id_conversation}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la conversation")
      }

      toast({
        variant: "success",
        title: "Conversation supprimée",
        description: "La conversation a été supprimée avec succès",
      })

      router.push("/dashboard/conversations")
    } catch (error) {
      // console.error("Erreur handleDelete:", error)

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
      })
    }
  }

  // Chargement initial des données
  useEffect(() => {
    fetchConversation()
  }, [fetchConversation])

  // Mettre à jour le statut lorsqu'il change
  useEffect(() => {
    if (updateStatus) {
      updateConversationStatus(updateStatus)
    }
  }, [updateStatus])

  // Formater la date
  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Formatter l'heure des messages
  const formatMessageTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "numeric",
    })
  }

  // Obtenir le statut en français
  const getStatusLabel = (status: ConversationStatus) => {
    switch (status) {
      case ConversationStatus.ACTIVE:
        return "Active"
      case ConversationStatus.PENDING_ADMIN:
        return "En attente"
      case ConversationStatus.CLOSED:
        return "Fermée"
      default:
        return status
    }
  }

  return {
    conversation,
    messages,
    loading,
    error,
    input,
    setInput,
    sending,
    statusUpdating,
    updateStatus,
    setUpdateStatus,
    handleSendMessage,
    updateConversationStatus,
    handleDelete,
    formatDate,
    formatMessageTime,
    getStatusLabel,
  }
}
