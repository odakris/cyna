"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { HeroCarouselForm } from "@/components/Forms/HeroCarouselForm"
import { ArrowLeft } from "lucide-react"
import { HeroCarouselSlide } from "@prisma/client"

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
    return (
      <div className="mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (errorMessage || !slide) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Modifier le Slide</h1>
        <p className="text-red-500">{errorMessage || "Slide introuvable"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/hero-carousel">Retour</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Modifier le Slide</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier les informations</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroCarouselForm initialData={slide} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  )
}
