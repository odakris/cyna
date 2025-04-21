"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CategoryForm } from "@/components/Forms/CategoryForm"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { CategoryFormSkeleton } from "@/components/Skeletons/CategorySkeletons"

export default function CreateCategoryPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler un temps de chargement pour démontrer le skeleton
    // Dans un cas réel, ce serait probablement pour charger des données supplémentaires
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer des catégories." />
      }
    >
      {isLoading ? (
        <CategoryFormSkeleton />
      ) : (
        <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link href="/dashboard/categories">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Créer une Nouvelle Catégorie</h1>
          </div>
          <CategoryForm />
        </div>
      )}
    </RoleGuard>
  )
}
