"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductForm } from "@/components/Forms/ProductForm"
import { ArrowLeft } from "lucide-react"
import { Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { ProductFormSkeleton } from "@/components/Skeletons/ProductSkeletons"
import { useCategories } from "@/hooks/category/use-categories"

export function CreateProductPage() {
  const { categories, loading, errorMessage } = useCategories()

  if (loading) {
    return <ProductFormSkeleton />
  }

  if (errorMessage || categories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Créer un Nouveau Produit</h1>
        <p className="text-red-500">
          {errorMessage || "Aucune catégorie disponible pour créer un produit"}
        </p>
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
      <div className="mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
          >
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold">
            <span className="hidden sm:inline">Créer un Nouveau Produit</span>
            <span className="sm:hidden">Nouveau Produit</span>
          </h1>
        </div>
        <ProductForm categories={categories} />
      </div>
    </RoleGuard>
  )
}
