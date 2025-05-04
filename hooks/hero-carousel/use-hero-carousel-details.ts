import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { HeroCarouselSlide } from "@prisma/client"

export function useHeroCarouselDetails(id: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [slide, setSlide] = useState<HeroCarouselSlide | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/hero-carousel/${id}`)

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération du slide (${response.status})`
        )
      }

      const data = await response.json()
      setSlide(data)
      setErrorMessage(null)
    } catch (error) {
      console.error("Erreur fetchData:", error)
      setErrorMessage("Erreur lors du chargement des données.")
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du slide.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEdit = () => {
    router.push(`/dashboard/hero-carousel/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/hero-carousel/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du slide")
      }

      toast({
        title: "Slide supprimé",
        variant: "success",
        description: "Le slide a été supprimé avec succès.",
      })

      router.push("/dashboard/hero-carousel")
    } catch (error) {
      console.error("Erreur handleDelete:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleToggleActive = async () => {
    if (!slide) return

    try {
      const response = await fetch(`/api/hero-carousel/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !slide.active }),
      })

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la mise à jour du slide (${response.status})`
        )
      }

      const updatedSlide = await response.json()
      setSlide(updatedSlide)

      toast({
        title: "Slide mis à jour",
        variant: "success",
        description: `Le slide a été ${updatedSlide.active ? "activé" : "désactivé"}`,
      })
    } catch (error) {
      console.error("Échec de la mise à jour du slide:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le statut du slide n'a pas pu être modifié",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return {
    slide,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleDelete,
    handleToggleActive,
    formatDate,
  }
}
