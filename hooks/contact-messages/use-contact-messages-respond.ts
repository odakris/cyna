import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  contactMessageResponseSchema,
  ContactMessageResponseValues,
} from "@/lib/validations/contact-message-schema"
import { useToast } from "@/hooks/use-toast"
import { ContactMessage } from "@/components/Admin/ContactMessages/ContactMessageColumns"

export function useContactMessageRespond(messageId: string) {
  const [message, setMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const { toast } = useToast()

  const form = useForm<ContactMessageResponseValues>({
    resolver: zodResolver(contactMessageResponseSchema),
    defaultValues: {
      id_message: parseInt(messageId) || 0,
      response: "",
    },
  })

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

  const onSubmit = async (data: ContactMessageResponseValues) => {
    try {
      const response = await fetch("/api/contact-message/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || "Erreur lors de l'envoi de la réponse"
        )
      }

      setIsSubmitted(true)
      form.reset()
      toast({
        variant: "success",
        title: "Réponse envoyée",
        description: "Votre réponse a été envoyée avec succès.",
      })

      // Redirect back to dashboard after a delay
      // setTimeout(() => {
      //   router.push("/dashboard/contact")
      // }, 2000)
    } catch (error) {
      // console.error("Erreur lors de l'envoi:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite. Veuillez réessayer.",
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
    isSubmitted,
    setIsSubmitted,
    fetchMessage,
    formatDate,
    form,
    onSubmit,
  }
}
