"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Category } from "@prisma/client"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Tag,
  CalendarDays,
  ShieldAlert,
  ImageIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function CategoryDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [category, setCategory] = useState<Category>()
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productCount, setProductCount] = useState<number>(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryData = await fetch(`/api/categories/${id}`).then(res =>
          res.json()
        )

        if (!categoryData) throw new Error("Catégorie introuvable")

        setCategory(categoryData)

        // Simuler un comptage de produits dans cette catégorie (à implémenter réellement)
        console.log(categoryData)
        setProductCount(categoryData.products.length)
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
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      })

      router.push("/dashboard/categories")
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

  if (errorMessage || !category) {
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
              <Link href="/dashboard/categories">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Détails de la Catégorie</h1>
              <p className="text-muted-foreground">
                Consulter les informations de la catégorie
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
              {errorMessage || "Catégorie introuvable"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-6">
            <Button asChild variant="outline">
              <Link href="/dashboard/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link href="/dashboard/categories">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{category.name}</h1>
              <p className="text-muted-foreground">
                Détails et produits associés
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
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
                    Êtes-vous sûr de vouloir supprimer la catégorie &quot;
                    {category.name}&quot; ? Cette action est irréversible.
                  </DialogDescription>
                </DialogHeader>

                {productCount > 0 && (
                  <div className="my-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-amber-600 flex items-center">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Attention: Cette catégorie contient {productCount} produit
                      {productCount > 1 ? "s" : ""}. La suppression affectera
                      tous ces produits.
                    </p>
                  </div>
                )}

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
                <ImageIcon className="h-5 w-5" />
                Aperçu de la catégorie
              </CardTitle>
              <CardDescription>
                Image et description détaillée de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                <Image
                  width={500}
                  height={300}
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {category.description ||
                    "Aucune description disponible pour cette catégorie."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne d'informations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Informations
              </CardTitle>
              <CardDescription>
                Détails techniques de la catégorie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nom</p>
                <p className="font-semibold">{category.name}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Priorité d&apos;affichage
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{category.priority_order}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {category.priority_order === 1
                      ? "(Priorité maximale)"
                      : category.priority_order < 5
                        ? "(Haute priorité)"
                        : "(Priorité standard)"}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Produits associés
                </p>
                <div className="flex items-center gap-2">
                  <Badge>{productCount}</Badge>
                  <span className="text-sm text-muted-foreground">
                    produit{productCount !== 1 ? "s" : ""}
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
                  {new Date(category.updated_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
