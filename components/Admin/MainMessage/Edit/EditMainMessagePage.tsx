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
      <div className="container mx-auto p-3 sm:p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500 text-base sm:text-lg">
              Erreur
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {errorMessage || "Message introuvable"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="text-xs sm:text-sm">
              <Link href="/dashboard/main-message">
                <ArrowLeft className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Retour à la liste
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
        >
          <Link href="/dashboard/main-message">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
        </Button>
        <h1 className="text-xl sm:text-3xl font-bold">
          <span className="hidden sm:inline">Modifier le Message</span>
          <span className="sm:hidden">Modifier</span>
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
