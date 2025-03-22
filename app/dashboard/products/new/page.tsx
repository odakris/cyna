"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ProductForm } from "@/components/Forms/ProductForm"
import { CategoryType } from "@/types/Types"
import { getAllCategories } from "@/lib/services/category-service"
import { ArrowLeft } from "lucide-react"

export default function CreateProductPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories()
        if (!data) throw new Error("Catégories introuvables")
        setCategories(data)
      } catch (error) {
        console.error("Erreur fetchCategories:", error)
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

  if (errorMessage && !categories.length) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Créer un Nouveau Produit</h1>
        <p className="text-red-500">{errorMessage}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">Retour</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/dashboard/products">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Créer un Nouveau Produit</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un Produit</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
