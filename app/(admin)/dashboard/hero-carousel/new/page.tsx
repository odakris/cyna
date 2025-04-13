"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { HeroCarouselForm } from "@/components/Forms/HeroCarouselForm"
import { ArrowLeft } from "lucide-react"

export default function NewHeroCarouselSlidePage() {
  return (
    <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Ajouter un Slide</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du slide</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroCarouselForm />
        </CardContent>
      </Card>
    </div>
  )
}
