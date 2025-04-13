"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { CategoryType, ProductWithImages } from "@/types/Types"
import {
  Card,
  CardContent,
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
  ShoppingBag,
  Trash2,
  ShieldAlert,
  ImageIcon,
  CalendarDays,
  ListChecks,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Layers,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ProductImageGallery } from "@/components/Carousel/ProductImageGallery"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ProductDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [product, setProduct] = useState<ProductWithImages | null>(null)
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData: ProductWithImages = await fetch(
          `/api/products/${id}`
        ).then(res => res.json())

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

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${id}`, {
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-1/3" />

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link href="/dashboard/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Détails du Produit</h1>
              <p className="text-muted-foreground">
                Consulter les informations du produit
              </p>
            </div>
          </div>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">Erreur</CardTitle>
            </div>
            <CardDescription className="text-red-600">
              {errorMessage || "Produit introuvable"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-6">
            <Button asChild variant="outline">
              <Link href="/dashboard/products">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link href="/dashboard/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Link
                  href={`/dashboard/categories/${category?.id_category}`}
                  className="hover:text-primary hover:underline flex items-center gap-1"
                >
                  <Tag className="h-3.5 w-3.5" />
                  {category?.name || "Non catégorisé"}
                </Link>
                <span>•</span>
                <span>Réf: #{product.id_product}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href={`/produit/${product.id_product}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir sur le site
              </Link>
            </Button>

            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer la suppression</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir supprimer le produit &quot;
                    {product.name}&quot; ? Cette action est irréversible.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-4 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Confirmer la suppression
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale avec les détails */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Informations du produit
              </CardTitle>
              <CardDescription>
                Données générales sur le produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 aspect-square rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
                  <Image
                    width={300}
                    height={300}
                    src={product.main_image || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {product.description ||
                        "Aucune description disponible pour ce produit."}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Prix unitaire
                      </h4>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(product.unit_price)}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Statut
                      </h4>
                      <div>
                        {product.available ? (
                          <Badge className="bg-green-500 hover:bg-green-600 text-white">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Disponible
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-red-200 text-red-600 bg-red-50"
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Indisponible
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                Spécifications techniques
              </CardTitle>
              <CardDescription>
                Détails techniques et caractéristiques du produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.technical_specs ? (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {product.technical_specs}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ShieldAlert className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                  <p className="text-muted-foreground">
                    Aucune spécification technique disponible pour ce produit.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="mt-3"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Ajouter des spécifications
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Galerie d&apos;images
              </CardTitle>
              <CardDescription>
                Images du produit dans le carrousel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {product.product_caroussel_images &&
              product.product_caroussel_images.length > 0 ? (
                <div className="bg-muted/10 rounded-xl p-6">
                  <ProductImageGallery
                    images={product.product_caroussel_images}
                    productName={product.name}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ImageIcon className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
                  <p className="text-muted-foreground">
                    Aucune image supplémentaire disponible.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="mt-3"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Ajouter des images
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Colonne d'informations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Informations
              </CardTitle>
              <CardDescription>Détails techniques du produit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Stock
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{product.stock} unités</p>
                  <Badge
                    variant={product.stock > 0 ? "outline" : "destructive"}
                    className={
                      product.stock > 0
                        ? product.stock <= 5
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-green-100 text-green-800 border-green-200"
                        : ""
                    }
                  >
                    {product.stock === 0
                      ? "Rupture"
                      : product.stock <= 5
                        ? "Critique"
                        : product.stock <= 10
                          ? "Faible"
                          : "Bon"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Catégorie
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold">
                    {category?.name || "Non catégorisé"}
                  </p>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                  >
                    <Link
                      href={`/dashboard/categories/${category?.id_category}`}
                    >
                      <Layers className="h-3.5 w-3.5 mr-1" />
                      Voir
                    </Link>
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Priorité d&apos;affichage
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={
                      product.priority_order <= 3
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : product.priority_order <= 7
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                    }
                  >
                    {product.priority_order}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {product.priority_order <= 3
                      ? "(Haute priorité)"
                      : product.priority_order <= 7
                        ? "(Priorité moyenne)"
                        : "(Priorité standard)"}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Dernière mise à jour
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(product.updated_at.toString())}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date de création
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {formatDate(product.created_at.toString())}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
