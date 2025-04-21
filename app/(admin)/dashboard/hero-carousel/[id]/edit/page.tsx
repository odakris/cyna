"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { HeroCarouselForm } from "@/components/Forms/HeroCarouselForm"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { HeroCarouselSlide, Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { HeroCarouselFormSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"

export default function EditHeroCarouselSlidePage() {
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const [slide, setSlide] = useState<HeroCarouselSlide | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
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
        setErrorMessage("Erreur lors du chargement des données.")
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

  if (loading) {
    return <HeroCarouselFormSkeleton />
  }

  if (errorMessage || !slide) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Modifier le Slide</h1>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="text-xl font-bold text-red-500">Erreur</h2>
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
        <AccessDenied message="Vous n'avez pas la permission de modifier des slides." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Modifier le Slide</h1>
        </div>
        <HeroCarouselForm initialData={slide} isEditing={true} />
      </div>
    </RoleGuard>
  )
}
