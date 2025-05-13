import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { ProductWithImages } from "@/types/Types"
import { ProductFormValues } from "@/lib/validations/product-schema"
import { Category } from "@prisma/client"

export function useProductForm(productId: string) {
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [initialData, setInitialData] = useState<ProductFormValues | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Charger les données du produit et des catégories en parallèle
        const [productData, categoriesData] = await Promise.all([
          fetch(`/api/products/${productId}`).then(res => res.json()),
          fetch("/api/categories").then(res => res.json()),
        ])

        if (!productData) throw new Error("Produit introuvable")
        if (!categoriesData) throw new Error("Catégories introuvables")

        setProduct(productData)
        setCategories(categoriesData)

        // Conversion du Product en ProductFormValues
        const formData: ProductFormValues = {
          name: productData.name,
          description: productData.description,
          technical_specs: productData.technical_specs,
          unit_price: productData.unit_price,
          stock: productData.stock,
          id_category: productData.id_category,
          main_image: productData.main_image,
          active: productData.active,
          product_caroussel_images: productData.product_caroussel_images.map(
            (image: { url: string }) => image.url
          ),
          priority_order: productData.priority_order,
          available: productData.available,
        }

        setInitialData(formData)
        setErrorMessage(null)
      } catch (error) {
        // console.error("Erreur fetchData:", error)
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

  return {
    product,
    categories,
    loading,
    errorMessage,
    initialData,
  }
}
