import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { HeroCarouselSlide } from "@prisma/client"
import { HeroCarouselFormValues } from "@/lib/validations/hero-carousel-schema"

export function useHeroCarouselForm(slideId?: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [slide, setSlide] = useState<HeroCarouselSlide | null>(null)
  const [loading, setLoading] = useState<boolean>(slideId ? true : false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [initialData, setInitialData] = useState<HeroCarouselFormValues | null>(
    null
  )

  const isEditing = !!slideId

  // Fetch slide data if editing
  const fetchData = useCallback(async () => {
    if (!slideId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/hero-carousel/${slideId}`)

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération du slide (${response.status})`
        )
      }

      const data = await response.json()
      setSlide(data)

      // Convert to form values format
      const formData: HeroCarouselFormValues = {
        title: data.title,
        description: data.description || "",
        image_url: data.image_url,
        button_text: data.button_text || "",
        button_link: data.button_link || "",
        active: data.active,
        priority_order: data.priority_order,
      }

      setInitialData(formData)
      setErrorMessage(null)
    } catch (error) {
      // console.error("Erreur fetchData:", error)
      setErrorMessage("Erreur lors du chargement des données.")
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du slide.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [slideId, toast])

  // In creation mode, initialize with default values
  useEffect(() => {
    if (!slideId) {
      const defaultData: HeroCarouselFormValues = {
        title: "",
        description: "",
        image_url: "",
        button_text: "",
        button_link: "",
        active: true,
        priority_order: 999,
      }
      setInitialData(defaultData)
    } else {
      fetchData()
    }
  }, [slideId, fetchData])

  // Handle form submission
  const onSubmit = async (data: HeroCarouselFormValues) => {
    try {
      setIsSubmitting(true)

      // Clean data if needed
      const formattedData = {
        ...data,
        description: data.description || null,
        button_text: data.button_text || null,
        button_link: data.button_link || null,
        priority_order: Number(data.priority_order),
      }

      if (slideId && isEditing) {
        // Mode édition
        const response = await fetch(`/api/hero-carousel/${slideId}`, {
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
          title: "Slide mis à jour",
          variant: "success",
          description: "Le slide a été mis à jour avec succès.",
        })
      } else {
        // Mode création
        const response = await fetch("/api/hero-carousel", {
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
          title: "Slide créé",
          variant: "success",
          description: "Le nouveau slide a été créé avec succès.",
        })
      }

      // Redirect back to list
      router.push("/dashboard/hero-carousel")
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
    slide,
    loading,
    errorMessage,
    initialData,
    isSubmitting,
    isEditing,
    onSubmit,
  }
}
