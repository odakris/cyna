"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import MainMessageForm from "@/components/Forms/MainMessageForm"
import { ArrowLeft } from "lucide-react"
import { useMainMessageForm } from "@/hooks/main-message/use-main-message-form"
import { MainMessageFormSkeleton } from "@/components/Skeletons/MainMessageSkeletons"

export default function NewMainMessagePage() {
  const [loading, setLoading] = useState(true)
  const { initialData, isSubmitting, onSubmit } = useMainMessageForm()

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
          <span className="hidden sm:inline">Créer un Nouveau Message</span>
          <span className="sm:hidden">Nouveau Message</span>
        </h1>
      </div>
      <MainMessageForm
        initialData={initialData || undefined}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </div>
  )
}
