"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { MainMessageForm } from "@/components/Forms/MainMessageForm"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { MainMessage } from "@prisma/client"

export default function EditMainMessagePage({}) {
  const { id } = useParams() as { id: string }

  const [message, setMessage] = useState<MainMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              disabled
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Skeleton className="h-10 w-64" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
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
            <h1 className="text-3xl font-bold">Modifier le Message</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du message</CardTitle>
          <CardDescription>
            Modifiez le contenu et l&apos;apparence du message principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <MainMessageForm initialData={message} isEditing={true} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
