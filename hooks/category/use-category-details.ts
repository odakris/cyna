import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Category } from "@prisma/client"

export function useCategoryDetails(id: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [category, setCategory] = useState<Category>()
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productCount, setProductCount] = useState<number>(0)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const categoryData = await fetch(`/api/categories/${id}`).then(res =>
        res.json()
      )

      if (!categoryData) throw new Error("Catégorie introuvable")

      setCategory(categoryData)

      // Obtenir le comptage de produits dans cette catégorie
      setProductCount(categoryData.products?.length || 0)
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
  }, [id, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEdit = () => {
    router.push(`/dashboard/categories/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la catégorie")
      }

      toast({
        variant: "success",
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      })

      router.push("/dashboard/categories")
    } catch (error) {
      // console.error("Erreur handleDelete:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      })
    }
  }

  // Nouvelle fonction pour mettre à jour le statut actif de la catégorie
  const handleStatusChange = (newStatus: boolean) => {
    if (category) {
      // Mettre à jour l'état local de la catégorie
      setCategory({
        ...category,
        active: newStatus,
        updated_at: new Date(),
      })
    }
  }

  return {
    category,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    productCount,
    handleEdit,
    handleDelete,
    handleStatusChange, // Exposer la nouvelle fonction
  }
}
