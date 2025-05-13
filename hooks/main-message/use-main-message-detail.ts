import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { MainMessage } from "@prisma/client"

export function useMainMessageDetail(messageId: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [message, setMessage] = useState<MainMessage | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Récupérer les détails du message
  const fetchMessage = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/main-message/${messageId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Message non trouvé")
        }
        throw new Error(
          `Erreur lors de la récupération des données: ${response.statusText}`
        )
      }

      const data = await response.json()
      setMessage(data)
      setError(null)
    } catch (error) {
      // console.error("Erreur lors du chargement du message:", error)
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      )
    } finally {
      setLoading(false)
    }
  }, [messageId])

  // Charger le message au montage du composant
  useEffect(() => {
    fetchMessage()
  }, [fetchMessage])

  // Supprimer le message
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/main-message/${messageId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du message")
      }

      toast({
        title: "Message supprimé",
        variant: "success",
        description: "Le message a été supprimé avec succès.",
      })

      router.push("/dashboard/main-message")
      router.refresh()
    } catch (error) {
      // console.error("Erreur lors de la suppression:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      })
    } finally {
      setShowDeleteDialog(false)
    }
  }

  // Mise à jour du statut actif
  const toggleActiveStatus = async () => {
    if (!message) return

    try {
      setIsUpdating(true)
      const newStatus = !message.active

      const response = await fetch(`/api/main-message/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du statut")
      }

      // Mettre à jour l'état local
      setMessage(prev => (prev ? { ...prev, active: newStatus } : null))

      toast({
        title: newStatus ? "Message activé" : "Message désactivé",
        variant: newStatus ? "success" : "destructive",
        description: `Le message est maintenant ${newStatus ? "actif" : "inactif"}.`,
      })
    } catch (error) {
      // console.error("Erreur toggleActiveStatus:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut du message",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Mise à jour du statut d'arrière-plan
  const toggleBackgroundStatus = async () => {
    if (!message) return

    try {
      setIsUpdating(true)
      const newStatus = !message.has_background

      const response = await fetch(`/api/main-message/${messageId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ has_background: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour de l'arrière-plan")
      }

      // Mettre à jour l'état local
      setMessage(prev => (prev ? { ...prev, has_background: newStatus } : null))

      toast({
        title: newStatus ? "Arrière-plan activé" : "Arrière-plan désactivé",
        description: `L'arrière-plan est maintenant ${newStatus ? "actif" : "inactif"}.`,
      })
    } catch (error) {
      // console.error("Erreur toggleBackgroundStatus:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier le statut de l'arrière-plan",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Navigation vers la page d'édition
  const handleEdit = () => {
    router.push(`/dashboard/main-message/${messageId}/edit`)
  }

  // Formateur de date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non disponible"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return {
    message,
    loading,
    error,
    showDeleteDialog,
    setShowDeleteDialog,
    isUpdating,
    handleDelete,
    toggleActiveStatus,
    toggleBackgroundStatus,
    handleEdit,
    formatDate,
  }
}
