"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroCarouselForm } from "@/components/Forms/HeroCarouselForm"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { HeroCarouselFormSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"
import { useHeroCarouselForm } from "@/hooks/hero-carousel/use-hero-carousel-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface HeroCarouselFormPageProps {
  slideId?: string
}

export default function HeroCarouselFormPage({
  slideId,
}: HeroCarouselFormPageProps) {
  const { loading, errorMessage, initialData, isEditing, onSubmit } =
    useHeroCarouselForm(slideId)

  if (loading) {
    return <HeroCarouselFormSkeleton />
  }

  if (errorMessage || (isEditing && !initialData)) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">
            {isEditing ? "Modifier le Slide" : "Créer un Nouveau Slide"}
          </h1>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              <CardTitle className="text-red-500 text-base sm:text-lg">
                Erreur
              </CardTitle>
            </div>
            <CardDescription className="text-red-600 text-xs sm:text-sm">
              {errorMessage || "Slide introuvable"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-6">
            <Button asChild variant="outline" className="text-xs sm:text-sm">
              <Link href="/dashboard/hero-carousel">
                <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
      <div className="mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">
              <span className="hidden sm:inline">
                {isEditing ? "Modifier le Slide" : "Créer un Nouveau Slide"}
              </span>
              <span className="sm:hidden">
                {isEditing ? "Modifier" : "Nouveau Slide"}
              </span>
            </h1>
            {isEditing && initialData && (
              <p className="text-muted-foreground text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">
                {initialData.title}
              </p>
            )}
          </div>
        </div>
        <HeroCarouselForm
          initialData={initialData!}
          isEditing={isEditing}
          onSubmit={onSubmit}
        />
      </div>
    </RoleGuard>
  )
}
