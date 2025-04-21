"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ProductForm } from "@/components/Forms/ProductForm"
import { ArrowLeft } from "lucide-react"
import RoleGuard from "@/components/Auth/RoleGuard"
import { Role } from "@prisma/client"
import AccessDenied from "@/components/Auth/AccessDenied"
import { useEffect, useState } from "react"
import { Category } from "@prisma/client"
import { ProductFormSkeleton } from "@/components/Skeletons/ProductSkeletons"

export default function CreateProductPage() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetch("/api/categories").then(res => res.json())
        if (!data) throw new Error("Catégories introuvables")
        setCategories(data)
      } catch (error) {
        console.error("Erreur fetchCategories:", error)
        setErrorMessage("Erreur lors du chargement des catégories.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [toast])

  if (loading) {
    return <ProductFormSkeleton />
  }

  if (errorMessage || categories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Modifier le Produit</h1>
        <p className="text-red-500">{errorMessage || "Produit introuvable"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">Retour</Link>
        </Button>
      </div>
    )
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer des produits." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Créer un Nouveau Produit</h1>
        </div>
        <ProductForm categories={categories} />
      </div>
    </RoleGuard>
  )
}
