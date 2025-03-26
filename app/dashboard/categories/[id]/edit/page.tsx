"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { CategoryType } from "@/types/Types"
import { ArrowLeft } from "lucide-react"
import { CategoryFormValues } from "@/lib/validations/category-schema"
import { CategoryForm } from "@/components/Forms/CategoryForm"

export default function EditCategoryPage() {
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const [category, setCategory] = useState<CategoryType>()
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await fetch(`/api/categories/${id}`).then(res =>
          res.json()
        )

        if (!categoryData) throw new Error("Catégorie introuvable")

        setCategory(categoryData)
      } catch (error) {
        console.error("Erreur fetchData:", error)
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
  }, [id, toast])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
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

  if (errorMessage || !category) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Modifier la Categorie</h1>
        <p className="text-red-500">
          {errorMessage || "Categorie introuvable"}
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/categories">Retour</Link>
        </Button>
      </div>
    )
  }

  // Conversion du CategoryType en CategoriesFormValues
  const initialData: CategoryFormValues = {
    name: category.name,
    description: category.description,
    image: category.image,
    priority_order: category.priority_order,
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
          <CategoryForm
            initialData={initialData}
            isEditing={true}
            categoryId={Number(id)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
