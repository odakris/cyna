"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  contactMessageResponseSchema,
  ContactMessageResponseValues,
} from "@/lib/validations/contact-message-schema"
import {
  ArrowLeft,
  AlertTriangle,
  Reply,
  RefreshCw,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { ContactMessage } from "../../contact-message-columns"

export default function ContactMessageRespond() {
  const [message, setMessage] = useState<ContactMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactMessageResponseValues>({
    resolver: zodResolver(contactMessageResponseSchema),
    defaultValues: {
      id_message: parseInt(id) || 0,
      response: "",
    },
  })

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

  const onSubmit = async (data: ContactMessageResponseValues) => {
    try {
      const response = await fetch("/api/contact-message/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || "Erreur lors de l'envoi de la réponse"
        )
      }

      setIsSubmitted(true)
      reset()
      toast({
        title: "Succès",
        description: "Votre réponse a été envoyée avec succès.",
      })

      // Redirect back to dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard/contact")
      }, 2000)
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error)
      toast({
        variant: "destructive",
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur s'est produite. Veuillez réessayer.",
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
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    )
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
          <Reply className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">
            Répondre au Message
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/dashboard/contact/${id}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au message
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle>{message.subject}</CardTitle>
          <CardDescription>
            De :{" "}
            {message.user?.firstname && message.user?.lastname
              ? `${message.user.firstname} ${message.user.lastname} <${message.email}>`
              : message.email}
            <br />
            Envoyé le : {formatDate(message.sent_date)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none border-t pt-4">
            <p className="whitespace-pre-wrap text-muted-foreground">
              {message.message}
            </p>
          </div>

          {isSubmitted ? (
            <div className="flex items-center gap-2 text-green-600 font-medium p-4 bg-green-50 rounded-md">
              <CheckCircle className="h-5 w-5" />
              <span>Votre réponse a été envoyée avec succès.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="response"
                  className="block text-sm font-medium text-foreground"
                >
                  Votre réponse
                </label>
                <Textarea
                  id="response"
                  {...register("response")}
                  placeholder="Écrivez votre réponse ici..."
                  rows={8}
                  className="mt-1"
                  disabled={isSubmitting}
                />
                {errors.response && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {errors.response.message}
                  </p>
                )}
              </div>

              <Button
                variant={"cyna"}
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Reply className="mr-2 h-4 w-4" />
                    Envoyer la réponse
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
