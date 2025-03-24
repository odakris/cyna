"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CategoryType } from "@/types/Types"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Edit,
  Package,
  Calendar,
  ChartNoAxesCombined,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function CategoryDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData: CategoryType | null = await fetch(
          `/api/categories/${id}`
        ).then(res => res.json())
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

  const handleEdit = () => {
    router.push(`/dashboard/categories/${id}/edit`)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-1/3" />
        </div>

        <Card className="border border-gray-200 shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-8 w-2/5" />
              <Skeleton className="h-10 w-24 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <Skeleton className="h-64 w-64 mx-auto rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-md" />
                ))}
              </div>
            </div>
            <Skeleton className="md:col-span-2 h-20 w-full rounded-lg" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32 rounded-md" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (errorMessage || !category) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Détails de la Categorie</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
                <Package className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-600">Erreur</CardTitle>
              <CardDescription className="text-red-600">
                {errorMessage || "Catégorie introuvable"}
              </CardDescription>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/products">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la liste
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Détails de la Catégorie</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Category Card */}
      <Card className="overflow-hidden border-border/40 shadow-lg">
        <CardHeader className="flex flex-row justify-between items-start p-6 pb-0 bg-muted/20">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{category.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-6">
          {/* Image with image container */}
          <div className="flex justify-center items-center bg-muted/30 rounded-lg p-4">
            <div className="relative overflow-hidden rounded-md shadow-md transition-all hover:scale-105 duration-300">
              <Image
                src={category.image}
                alt={category.name}
                width={400}
                height={400}
                className="object-cover rounded-md"
                priority
              />
            </div>
          </div>

          {/* Category Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {category.description || "Pas de description disponible."}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <p className="font-medium">{category.priority_order}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Dernière mise à jour
                  </p>
                  <p className="font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {category.updated_at
                      ? new Date(category.updated_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Date de création
                  </p>
                  <p className="font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {category.updated_at
                      ? new Date(category.created_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/10 border-t px-6 py-4">
          <Button className="w-full sm:w-auto">
            <ChartNoAxesCombined className="mr-2 h-4 w-4" />
            Analytiques
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
