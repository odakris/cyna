"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeroCarouselForm } from "@/components/Forms/HeroCarouselForm"
import { ArrowLeft } from "lucide-react"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { HeroCarouselFormSkeleton } from "@/components/Skeletons/HeroCarouselSkeletons"
import { useState, useEffect } from "react"

export default function NewHeroCarouselSlidePage() {
  const [loading, setLoading] = useState(true)

  // Simulate a brief loading state to demonstrate the skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <HeroCarouselFormSkeleton />
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer un slide pour le carousel." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/hero-carousel">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Créer un Nouveau Slide</h1>
        </div>
        <HeroCarouselForm />
      </div>
    </RoleGuard>
  )
}
