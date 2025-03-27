"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CategoryType, ProductWithImages } from "@/types/Types"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ArrowLeft,
  Edit,
  Package,
  Calendar,
  Tag,
  ChartNoAxesCombined,
} from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Separator } from "@/components/ui/separator"
import { CarouselPlugin } from "../../../../components/Carousel/CarouselPlugin"

export default function ProductDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData: ProductWithImages = await fetch(
          `/api/products/${id}`
        ).then(res => res.json())
        console.log("Données reçues:", productData) // Debug

        if (!productData) throw new Error("Produit introuvable")
        setProduct(productData)

        const categoryData: CategoryType | null = await fetch(
          `/api/categories/${productData.id_category}`
        ).then(res => res.json())

        if (!categoryData) throw new Error("Catégorie introuvable")
        setCategory(categoryData)
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

  const handleEdit = () => {
    router.push(`/dashboard/products/${id}/edit`)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-1/3" />
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-8 w-2/5" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <Skeleton className="h-64 w-64 mx-auto rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
            <Skeleton className="md:col-span-2 h-20 w-full" />
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-7 w-48" />

              <div className="max-w-xl mx-auto">
                <Skeleton className="aspect-square w-full rounded-xl" />

                <div className="flex justify-center mt-4 gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>

                <div className="grid grid-cols-5 gap-2 mt-6">
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                  <Skeleton className="aspect-square rounded-md" />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Détails du Produit</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
                <Package className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-600">Erreur</CardTitle>
              <CardDescription className="text-red-600">
                {errorMessage || "Produit introuvable"}
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
          <h1 className="text-3xl font-bold">Détails du Produit</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Product Card */}
      <Card className="overflow-hidden border-border/40 shadow-lg">
        <CardHeader className="flex flex-row justify-between items-start p-6 pb-0 bg-muted/20">
          <div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              {category && (
                <Link
                  href={`/dashboard/categories/${category.id_category}`}
                  className="text-sm text-muted-foreground hover:underline hover:text-primary"
                >
                  <Tag className="h-3 w-3 inline mr-1" />
                  {category.name}
                </Link>
              )}
            </div>
            <Badge
              className={`px-3 py-1 my-3 ${
                product.available
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {product.available ? "Disponible" : "Indisponible"}
            </Badge>
          </div>

          <div className="text-right">
            <p className="text-xl text-muted-foreground">Prix</p>
            <p className="text-5xl font-bold text-gray-900">
              {product.unit_price} €
            </p>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-6">
          {/* Image with image container */}
          <div className="flex justify-center items-center bg-muted/30 rounded-lg p-4">
            <div className="relative overflow-hidden rounded-md shadow-md transition-all hover:scale-105 duration-300">
              <Image
                src={product.main_image || "/placeholder.png"}
                alt={product.name}
                width={400}
                height={400}
                className="object-cover rounded-md"
                priority
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || "Pas de description disponible."}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Stock</p>
                  <p className="font-semibold flex items-center">
                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                    {product.stock} unités
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Priorité</p>
                  <p className="font-medium">{product.priority_order}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Dernière mise à jour
                  </p>
                  <p className="font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {product.updated_at
                      ? new Date(product.updated_at).toLocaleDateString(
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
                    {product.updated_at
                      ? new Date(product.created_at).toLocaleDateString(
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

          <div className="md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">
              Spécifications Techniques
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.technical_specs || "Pas de spécification disponible."}
            </p>
          </div>

          <div className="md:col-span-2 space-y-6">
            <h3 className="text-lg font-semibold">Images du Carrousel</h3>
          </div>

          {product.product_caroussel_images &&
          product.product_caroussel_images.length > 0 ? (
            <div className="md:col-span-2 space-y-6">
              <div className="bg-muted/10 rounded-xl p-6 max-w-3xl mx-auto">
                {/* Carrousel */}
                <div className="flex justify-center items-center w-full mb-6">
                  <div className="w-full" style={{ maxWidth: "500px" }}>
                    <CarouselPlugin images={product.product_caroussel_images} />
                  </div>
                </div>

                {/* Miniatures */}
                <div className="flex justify-center items-center w-full">
                  <div
                    className="flex flex-wrap justify-center gap-3"
                    style={{ maxWidth: "500px" }}
                  >
                    {product.product_caroussel_images.map((image, index) => (
                      <div
                        key={index}
                        className="w-16 h-16 overflow-hidden rounded-md border border-muted hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => {
                          // Fonction pour sélectionner cette image
                        }}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={image.url || "/placeholder.png"}
                            alt={image.alt || `Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform hover:scale-110 duration-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-center">
                Images du Produit
              </h3>
              <div className="bg-muted/5 border border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <p className="text-muted-foreground flex flex-col items-center gap-2">
                  <span className="text-4xl">🖼️</span>
                  Aucune image supplémentaire disponible pour ce produit
                </p>
              </div>
            </div>
          )}
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
