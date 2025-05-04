import { useState, useEffect, useCallback } from "react"
import { HeroCarouselSlide } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"

// Type for slide statistics
type SlideStats = {
  total: number
  active: number
  inactive: number
  highPriority: number
}

export function useHeroCarouselData() {
  const [slides, setSlides] = useState<HeroCarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("tous")
  const [stats, setStats] = useState<SlideStats>({
    total: 0,
    active: 0,
    inactive: 0,
    highPriority: 0,
  })
  const { toast } = useToast()

  // Function to fetch all slides
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/hero-carousel")

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }

      const data: HeroCarouselSlide[] = await response.json()
      setSlides(data)

      // Calculate statistics
      const newStats = {
        total: data.length,
        active: data.filter(s => s.active).length,
        inactive: data.filter(s => !s.active).length,
        highPriority: data.filter(s => s.priority_order <= 3).length,
      }
      setStats(newStats)

      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchSlides:", error)
      setError("Erreur lors du chargement des slides")
    } finally {
      setLoading(false)
    }
  }, [])

  // Function to delete slides
  const deleteSlides = async (slideIds: number[]) => {
    try {
      for (const id of slideIds) {
        const response = await fetch(`/api/hero-carousel/${id}`, {
          method: "DELETE",
          headers: {
            "content-type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Error deleting slide ${id}`)
        }
      }

      // Reload slides after deletion
      await fetchSlides()

      toast({
        title: "Succès",
        variant: "success",
        description: `${slideIds.length} slide(s) supprimé(s)`,
      })

      return true
    } catch (error: unknown) {
      console.error("Erreur deleteSlides:", error)

      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer les slides sélectionnés",
      })

      throw error
    }
  }

  // Load slides on component mount
  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  return {
    slides,
    loading,
    error,
    setError,
    fetchSlides,
    deleteSlides,
    activeTab,
    setActiveTab,
    stats,
  }
}
