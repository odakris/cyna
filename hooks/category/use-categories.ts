import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Category } from "@prisma/client"

export function useCategories() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await fetch("/api/categories").then(res => res.json())

        if (!data) throw new Error("Catégories introuvables")

        setCategories(data)
        setErrorMessage(null)
      } catch (error) {
        // console.error("Erreur fetchCategories:", error)
        setErrorMessage("Erreur lors du chargement des catégories.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [toast])

  return {
    categories,
    loading,
    errorMessage,
  }
}
