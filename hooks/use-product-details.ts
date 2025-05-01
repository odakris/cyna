import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ProductWithImages } from "@/types/Types"
import { Category } from "@prisma/client"

export function useProductDetails(productId: string) {
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Charger les données du produit et de sa catégorie
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Une seule requête qui retourne à la fois le produit et sa catégorie
        const productData: ProductWithImages & { category: Category } =
          await fetch(`/api/products/${productId}`).then(res => res.json())

        if (!productData) throw new Error("Produit introuvable")

        setProduct(productData)
        setCategory(productData.category)
        setErrorMessage(null)
      } catch (error) {
        console.error("Erreur fetchData:", error)
        setErrorMessage("Erreur lors du chargement des données.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du produit.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId, toast])

  // Gérer la navigation vers la page d'édition
  const handleEdit = () => {
    router.push(`/dashboard/products/${productId}/edit`)
  }

  // Gérer la suppression du produit
  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du produit")
      }

      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      })

      router.push("/dashboard/products")
    } catch (error) {
      console.error("Erreur handleDelete:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price)
  }

  return {
    product,
    category,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleDelete,
    formatDate,
    formatPrice,
  }
}
