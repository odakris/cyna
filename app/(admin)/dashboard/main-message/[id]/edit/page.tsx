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
import { MainMessage, Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { MainMessageFormSkeleton } from "@/components/Skeletons/MainMessageSkeletons"

export default function EditMainMessagePage() {
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
    return <MainMessageFormSkeleton />
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
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de modifier les messages." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/main-message">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Modifiez le contenu et l&apos;apparence du message principal
          </h1>
        </div>
        {message && <MainMessageForm initialData={message} isEditing={true} />}
      </div>
    </RoleGuard>
  )
}
