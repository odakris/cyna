"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainMessageForm } from "@/components/Forms/MainMessageForm"
import { ArrowLeft } from "lucide-react"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { MainMessageFormSkeleton } from "@/components/Skeletons/MainMessageSkeletons"

export default function NewMainMessagePage() {
  const [loading, setLoading] = useState(true)

  // Simuler un court temps de chargement pour montrer le skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <MainMessageFormSkeleton />
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer un message." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/main-message">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Créer un Nouveau Message</h1>
        </div>
        <MainMessageForm />
      </div>
    </RoleGuard>
  )
}
