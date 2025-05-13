import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ContactMessage } from "@/components/Admin/ContactMessages/ContactMessageColumns"

export function useContactMessageDetails(messageId: string) {
  const [message, setMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false)
  const { toast } = useToast()
  const router = useRouter()

  const fetchMessage = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contact-message/${messageId}`)
      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }
      const data: ContactMessage = await response.json()
      setMessage(data)
      setError(null)
    } catch (error: unknown) {
      // console.error("Erreur fetchMessage:", error)
      setError("Erreur lors du chargement du message")
    } finally {
      setLoading(false)
    }
  }, [messageId])

  const markAsRead = useCallback(async () => {
    if (message?.is_read) return
    try {
      const response = await fetch(`/api/contact-message/${messageId}/read`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }
      setMessage(prev => (prev ? { ...prev, is_read: true } : null))
    } catch (error: unknown) {
      // console.error("Erreur markAsRead:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le message comme lu",
      })
    }
  }, [messageId, message?.is_read, toast])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/contact-message/${messageId}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }
      setShowDeleteDialog(false)
      toast({
        title: "",
        variant: "success",
        description: "Message supprimé",
      })
      router.push("/dashboard/contact")
    } catch (error: unknown) {
      // console.error("Erreur handleDelete:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le message",
      })
    }
  }

  useEffect(() => {
    fetchMessage()
  }, [fetchMessage])

  useEffect(() => {
    if (message && !message.is_read) {
      markAsRead()
    }
  }, [message, markAsRead])

  const formatDate = (dateString: string | Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  return {
    message,
    loading,
    error,
    showDeleteDialog,
    setShowDeleteDialog,
    fetchMessage,
    handleDelete,
    formatDate,
  }
}
