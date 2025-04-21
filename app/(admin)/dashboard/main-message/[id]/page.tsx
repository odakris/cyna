"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import {
  ArrowLeft,
  MessageSquareText,
  Loader2,
  PencilLine,
  Trash2,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MainMessage } from "@prisma/client"
import { MainMessageDetailSkeleton } from "@/components/Skeletons/MainMessageSkeletons"

export default function ViewMainMessagePage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [message, setMessage] = useState<MainMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/main-message/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            return notFound()
          }
          throw new Error(
            `Erreur lors de la récupération des données: ${response.statusText}`
          )
        }

        const data = await response.json()
        setMessage(data)
      } catch (err) {
        console.error("Erreur lors du chargement du message:", err)
        setError(err instanceof Error ? err.message : "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMessage()
    }
  }, [id])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/main-message/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du message")
      }

      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès.",
      })

      router.push("/dashboard/main-message")
      router.refresh()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur inconnue est survenue",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Date non disponible"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return <MainMessageDetailSkeleton />
  }
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/dashboard/main-message">Retour à la liste</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
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
              <Link href="/dashboard/main-message">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Détails du Message</h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir sur le site
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/main-message/${id}/edit`}>
                <PencilLine className="mr-2 h-4 w-4" />
                Modifier
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-primary" />
            Message Principal
          </CardTitle>
          <CardDescription>
            Détails complets du message principal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">Aperçu</h3>
            <div
              className={`p-6 rounded-md ${
                message?.has_background && message.background_color
                  ? message.background_color
                  : "bg-primary/5"
              }`}
            >
              <p
                className={`text-lg font-medium text-center ${
                  message?.text_color ? message.text_color : "text-foreground"
                }`}
              >
                {message?.content}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Informations Générales
              </h3>
              <dl className="grid grid-cols-[100px_1fr] gap-2">
                <dt className="font-medium text-muted-foreground">ID:</dt>
                <dd>#{message?.id_main_message}</dd>

                <dt className="font-medium text-muted-foreground">Contenu:</dt>
                <dd className="break-words">{message?.content}</dd>

                <dt className="font-medium text-muted-foreground">Statut:</dt>
                <dd>
                  {message?.active ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Actif
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                      <XCircle className="mr-1 h-3 w-3" /> Inactif
                    </Badge>
                  )}
                </dd>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Apparence</h3>
              <dl className="grid grid-cols-[150px_1fr] gap-2">
                <dt className="font-medium text-muted-foreground">
                  Arrière-plan:
                </dt>
                <dd>
                  {message?.has_background ? (
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Activé
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                      <XCircle className="mr-1 h-3 w-3" /> Désactivé
                    </Badge>
                  )}
                </dd>

                <dt className="font-medium text-muted-foreground">
                  Couleur d&apos;arrière-plan:
                </dt>
                <dd>
                  {message?.background_color ? (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded ${message.background_color}`}
                      ></div>
                      <span>{message.background_color}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Non définie
                    </span>
                  )}
                </dd>

                <dt className="font-medium text-muted-foreground">
                  Couleur du texte:
                </dt>
                <dd>
                  {message?.text_color ? (
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded bg-gray-100 ${message.text_color}`}
                      ></div>
                      <span>{message.text_color}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Par défaut
                    </span>
                  )}
                </dd>
              </dl>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-4">Dates</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-2 p-3 rounded-md border">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <dt className="font-medium">Créé le</dt>
                  <dd className="text-muted-foreground">
                    {formatDate(message?.created_at.toString())}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-md border">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <dt className="font-medium">Dernière mise à jour</dt>
                  <dd className="text-muted-foreground">
                    {formatDate(message?.updated_at.toString())}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action ne
              peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirmer la suppression
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
