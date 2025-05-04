"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import MainMessageForm from "@/components/Forms/MainMessageForm"
import { ArrowLeft } from "lucide-react"
import { useMainMessageForm } from "@/hooks/main-message/use-main-message-form"
import { MainMessageFormSkeleton } from "@/components/Skeletons/MainMessageSkeletons"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"

interface EditMainMessagePageProps {
  messageId: string
}

export default function EditMainMessagePage({
  messageId,
}: EditMainMessagePageProps) {
  const {
    initialData,
    loading,
    errorMessage,
    isSubmitting,
    isEditing,
    onSubmit,
  } = useMainMessageForm(messageId)

  if (loading) {
    return <MainMessageFormSkeleton />
  }

  if (errorMessage || !initialData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Erreur</CardTitle>
            <CardDescription>
              {errorMessage || "Message introuvable"}
            </CardDescription>
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

      <MainMessageForm
        initialData={initialData}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </div>
  )
}
