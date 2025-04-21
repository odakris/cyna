"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Reply,
  Trash2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { ContactMessage } from "../contact-message-columns"
import { ContactMessageDetailSkeleton } from "@/components/Skeletons/ContactMessageSkeletons"

export default function ContactMessageView() {
  const [message, setMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const fetchMessage = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contact-message/${id}`)
      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        )
      }
      const data: ContactMessage = await response.json()
      setMessage(data)
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchMessage:", error)
      setError("Erreur lors du chargement du message")
    } finally {
      setLoading(false)
    }
  }, [id])

  const markAsRead = React.useCallback(async () => {
    if (message?.is_read) return
    try {
      const response = await fetch(`/api/contact-message/${id}/read`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }
      setMessage(prev => (prev ? { ...prev, is_read: true } : null))
    } catch (error: unknown) {
      console.error("Erreur markAsRead:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le message comme lu",
      })
    }
  }, [id, message?.is_read, toast])

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/contact-message/${id}`, {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
        },
      })
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`)
      }
      setShowDeleteDialog(false)
      toast({
        title: "Succès",
        description: "Message supprimé",
      })
      router.push("/dashboard/contact")
    } catch (error: unknown) {
      console.error("Erreur handleDelete:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le message",
      })
    }
  }

  useEffect(() => {
    fetchMessage()
  }, [id, fetchMessage])

  useEffect(() => {
    if (message && !message.is_read) {
      markAsRead()
    }
  }, [message, markAsRead])

  if (loading) {
    return <ContactMessageDetailSkeleton />
  }

  if (error || !message) {
    return (
      <Card className="mx-auto max-w-lg mt-8 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Erreur</CardTitle>
          </div>
          <CardDescription>{error || "Message non trouvé"}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={fetchMessage}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  const formatDate = (dateString: string | Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString))
  }

  return (
    <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Détails du Message
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/contact")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/contact/${id}/respond`)}
          >
            <Reply className="mr-2 h-4 w-4" />
            Répondre
          </Button>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
                  Vous êtes sur le point de supprimer ce message. Cette action
                  ne peut pas être annulée.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Annuler</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Confirmer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{message.subject}</CardTitle>
              <CardDescription>
                De :{" "}
                {message.user?.firstname && message.user?.lastname
                  ? `${message.user.firstname} ${message.user.lastname} <${message.email}>`
                  : message.email}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge
                variant="outline"
                className={
                  message.is_responded
                    ? "bg-green-100 text-green-800"
                    : message.is_read
                      ? "bg-gray-100 text-gray-800"
                      : "bg-blue-100 text-blue-800"
                }
              >
                {message.is_responded ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3 text-green-600" />{" "}
                    Répondu
                  </>
                ) : message.is_read ? (
                  <>
                    <CheckCircle className="mr-1 h-3 w-3 text-gray-600" /> Lu
                  </>
                ) : (
                  <>
                    <XCircle className="mr-1 h-3 w-3 text-blue-600" /> Non lu
                  </>
                )}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Envoyé le {formatDate(message.sent_date)}</span>
          </div>
          <div className="prose max-w-none border-t pt-4">
            <p className="whitespace-pre-wrap">{message.message}</p>
          </div>
          {message.response && message.response_date && (
            <div className="border-l-4 border-primary pl-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Réponse envoyée le {formatDate(message.response_date)}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{message.response}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
