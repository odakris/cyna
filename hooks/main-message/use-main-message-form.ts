import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { MainMessage } from "@prisma/client"
import { MainMessageFormValues } from "@/lib/validations/main-message-schema"

export function useMainMessageForm(messageId?: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [message, setMessage] = useState<MainMessage | null>(null)
  const [loading, setLoading] = useState<boolean>(messageId ? true : false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<MainMessageFormValues | null>(
    null
  )

  const isEditing = !!messageId

  // Fetch message data if editing
  const fetchData = useCallback(async () => {
    if (!messageId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/main-message/${messageId}`)

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération du message (${response.status})`
        )
      }

      const data = await response.json()
      setMessage(data)

      // Convert to form values format
      const formData: MainMessageFormValues = {
        content: data.content,
        active: data.active,
        has_background: data.has_background,
        background_color: data.background_color || "",
        text_color: data.text_color || "",
      }

      setInitialData(formData)
      setErrorMessage(null)
    } catch (error) {
      // console.error("Erreur fetchData:", error)
      setErrorMessage("Erreur lors du chargement des données.")
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du message.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [messageId, toast])

  // In creation mode, initialize with default values
  useEffect(() => {
    if (!messageId) {
      const defaultData: MainMessageFormValues = {
        content: "",
        active: true,
        has_background: false,
        background_color: "",
        text_color: "",
      }
      setInitialData(defaultData)
    } else {
      fetchData()
    }
  }, [messageId, fetchData])

  // Handle form submission
  const onSubmit = async (data: MainMessageFormValues) => {
    try {
      setIsSubmitting(true)

      // Clean data
      const formattedData = {
        ...data,
        background_color: data.background_color || null,
        text_color: data.text_color || null,
      }

      if (messageId && isEditing) {
        // Mode édition
        const response = await fetch(`/api/main-message/${messageId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || "Une erreur est survenue lors de la mise à jour"
          )
        }

        toast({
          title: "Message mis à jour",
          variant: "success",
          description: "Le message a été mis à jour avec succès.",
        })
      } else {
        // Mode création
        const response = await fetch("/api/main-message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || "Une erreur est survenue lors de la création"
          )
        }

        toast({
          title: "Message créé",
          variant: "success",
          description: "Le nouveau message a été créé avec succès.",
        })
      }

      // Redirect back to list
      router.push("/dashboard/main-message")
      router.refresh()
    } catch (error) {
      // console.error("Erreur lors de la soumission du formulaire:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    message,
    loading,
    errorMessage,
    initialData,
    isSubmitting,
    isEditing,
    onSubmit,
  }
}
