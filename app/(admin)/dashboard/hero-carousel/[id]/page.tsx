"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Edit,
  Calendar,
  Link2 as LinkIcon,
  Trash2,
  ShieldAlert,
  ImageIcon,
  CalendarDays,
  ExternalLink,
  SlidersHorizontal,
  BarChart3,
  MonitorSmartphone,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { HeroCarouselSlide } from "@prisma/client"
import { HeroCarouselDetailSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"

export default function SlideDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [slide, setSlide] = useState<HeroCarouselSlide | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/hero-carousel/${id}`)

        if (!response.ok) {
          throw new Error(
            `Erreur lors de la récupération du slide (${response.status})`
          )
        }

        const data = await response.json()
        setSlide(data)
      } catch (error) {
        console.error("Erreur fetchData:", error)
        setErrorMessage("Erreur lors du chargement des données du slide.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du slide.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, toast])

  const handleEdit = () => {
    router.push(`/dashboard/hero-carousel/${id}/edit`)
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/hero-carousel/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du slide")
      }

      toast({
        title: "Slide supprimé",
        description: "Le slide a été supprimé avec succès.",
      })

      router.push("/dashboard/hero-carousel")
    } catch (error) {
      console.error("Erreur handleDelete:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  const handleToggleActive = async () => {
    if (!slide) return

    try {
      const response = await fetch(`/api/hero-carousel/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !slide.active }),
      })

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la mise à jour du slide (${response.status})`
        )
      }

      const updatedSlide = await response.json()
      setSlide(updatedSlide)

      toast({
        title: "Succès",
        description: `Le slide a été ${updatedSlide.active ? "activé" : "désactivé"}`,
      })
    } catch (error) {
      console.error("Échec de la mise à jour du slide:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Le statut du slide n'a pas pu être modifié",
      })
    }
  }

  if (loading) {
    return <HeroCarouselDetailSkeleton />
  }

  if (errorMessage || !slide) {
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
              <Link href="/dashboard/hero-carousel">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Détails du Slide</h1>
              <p className="text-muted-foreground">
                Consulter les informations du slide du carousel
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
              {errorMessage || "Slide introuvable"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-6">
            <Button asChild variant="outline">
              <Link href="/dashboard/hero-carousel">
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
              <Link href="/dashboard/hero-carousel">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{slide.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Slide Carousel
                </span>
                <span>•</span>
                <span>ID: #{slide.id_hero_slide}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/" target="_blank">
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
                    Êtes-vous sûr de vouloir supprimer le slide &quot;
                    {slide.title}&quot; ? Cette action est irréversible.
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
                <MonitorSmartphone className="h-5 w-5" />
                Aperçu du slide
              </CardTitle>
              <CardDescription>
                Visualisation du slide tel qu&apos;il apparaît sur la page
                d&apos;accueil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative rounded-lg overflow-hidden h-96 w-full bg-slate-100">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center p-8">
                  <div className="max-w-lg text-white">
                    <h2 className="text-3xl font-bold mb-4">{slide.title}</h2>
                    {slide.description && (
                      <p className="text-lg mb-6">{slide.description}</p>
                    )}
                    {slide.button_text && slide.button_link && (
                      <Button size="lg">{slide.button_text}</Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {slide.description ||
                      "Aucune description disponible pour ce slide."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Bouton d&apos;action
                  </h3>
                  {slide.button_text && slide.button_link ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {slide.button_text}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" />
                        Lien: {slide.button_link}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Aucun bouton configuré pour ce slide.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Source de l&apos;image
              </CardTitle>
              <CardDescription>
                Détails de l&apos;image utilisée dans le slide
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground break-all">
                  URL: <span className="font-mono">{slide.image_url}</span>
                </p>
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleEdit}
                      className="text-sm"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Changer l&apos;image
                    </Button>
                    <Button variant="outline" asChild className="text-sm">
                      <Link href={slide.image_url} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Voir l&apos;image originale
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne d'informations */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Informations
              </CardTitle>
              <CardDescription>Détails du slide</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Statut
                </p>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    {slide.active ? (
                      <Badge className="bg-green-500 hover:bg-green-600 text-white">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-red-200 text-red-600 bg-red-50"
                      >
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactif
                      </Badge>
                    )}
                  </div>
                  <Switch
                    checked={slide.active}
                    onCheckedChange={handleToggleActive}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Priorité d&apos;affichage
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="outline"
                    className={
                      slide.priority_order <= 3
                        ? "bg-red-100 text-red-700 border-red-200"
                        : slide.priority_order <= 7
                          ? "bg-amber-100 text-amber-700 border-amber-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                    }
                  >
                    <BarChart3 className="mr-1 h-3 w-3" />
                    {slide.priority_order}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {slide.priority_order <= 3
                      ? "(Haute priorité)"
                      : slide.priority_order <= 7
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
                <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(slide.updated_at.toString())}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Date de création
                </p>
                <p className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(slide.created_at.toString())}
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 pt-6 border-t flex justify-end">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="mr-2 h-3 w-3" />
                Modifier les détails
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Actions rapides
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full justify-start"
                variant={slide.active ? "outline" : "default"}
                onClick={handleToggleActive}
              >
                {slide.active ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Désactiver le slide
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Activer le slide
                  </>
                )}
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={handleEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier le slide
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                asChild
              >
                <Link href="/" target="_blank">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Voir sur le site
                </Link>
              </Button>

              <Button
                className="w-full justify-start"
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le slide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
