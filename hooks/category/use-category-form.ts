import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Category } from "@prisma/client"
import { CategoryFormValues } from "@/lib/validations/category-schema"

export function useCategoryForm(categoryId: string) {
  const { toast } = useToast()
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<CategoryFormValues | null>(
    null
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const categoryData = await fetch(`/api/categories/${categoryId}`).then(
          res => res.json()
        )

        if (!categoryData) throw new Error("Catégorie introuvable")

        setCategory(categoryData)

        // Conversion de Category en CategoryFormValues
        const formData: CategoryFormValues = {
          name: categoryData.name,
          description: categoryData.description,
          image: categoryData.image,
          priority_order: categoryData.priority_order,
          active: categoryData.active,
        }

        setInitialData(formData)
        setErrorMessage(null)
      } catch (error) {
        // console.error("Erreur fetchData:", error)
        setErrorMessage("Erreur lors du chargement des données.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de la catégorie.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categoryId, toast])

  return {
    category,
    loading,
    errorMessage,
    initialData,
  }
}
