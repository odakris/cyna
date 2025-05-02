// components/Admin/HeroCarousel/Form/HeroCarouselFormPage.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroCarouselForm } from "@/components/Forms/HeroCarouselForm"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { HeroCarouselFormSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"
import { useHeroCarouselForm } from "@/hooks/use-hero-carousel-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface HeroCarouselFormPageProps {
  slideId?: string
}

export default function HeroCarouselFormPage({
  slideId,
}: HeroCarouselFormPageProps) {
  const {
    loading,
    errorMessage,
    initialData,
    isEditing,
    onSubmit, // Récupérer la fonction onSubmit du hook
  } = useHeroCarouselForm(slideId)

  if (loading) {
    return <HeroCarouselFormSkeleton />
  }

  if (errorMessage || (isEditing && !initialData)) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Modifier le Slide" : "Créer un Nouveau Slide"}
          </h1>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <CardTitle className="text-xl font-bold text-red-500">
                Erreur
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 mb-4">
              {errorMessage || "Slide introuvable"}
            </p>
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

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied
          message={`Vous n'avez pas la permission de ${isEditing ? "modifier" : "créer"} des slides.`}
        />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? "Modifier le Slide" : "Créer un Nouveau Slide"}
          </h1>
        </div>
        <HeroCarouselForm
          initialData={initialData!}
          isEditing={isEditing}
          onSubmit={onSubmit} // Passer la fonction onSubmit du hook
        />
      </div>
    </RoleGuard>
  )
}
