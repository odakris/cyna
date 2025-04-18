"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ProductForm } from "@/components/Forms/ProductForm"
import { ProductWithImages } from "@/types/Types"
import { ProductFormValues } from "@/lib/validations/product-schema"
import { ArrowLeft } from "lucide-react"
import { Category } from "@prisma/client"

export default function EditProductPage() {
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, categoriesData] = await Promise.all([
          await fetch(`/api/products/${id}`).then(res => res.json()),
          await fetch("/api/categories").then(res => res.json()),
        ])

        if (!productData) throw new Error("Produit introuvable")
        if (!categoriesData) throw new Error("Catégories introuvables")

        setProduct(productData)
        setCategories(categoriesData)
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
  }, [id, toast])

  if (loading) {
    return (
      <div className="mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Modifier le Produit</h1>
        <p className="text-red-500">{errorMessage || "Produit introuvable"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">Retour</Link>
        </Button>
      </div>
    )
  }

  // Conversion du ProductType en ProductFormValues
  const initialData: ProductFormValues = {
    name: product.name,
    description: product.description,
    technical_specs: product.technical_specs,
    unit_price: product.unit_price,
    stock: product.stock,
    id_category: product.id_category,
    main_image: product.main_image,
    product_caroussel_images: product.product_caroussel_images.map(
      image => image.url
    ),
    priority_order: product.priority_order,
    available: product.available,
  }

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Modifier le Produit</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier les informations</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            categories={categories}
            initialData={initialData}
            isEditing={true}
            productId={Number(id)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
