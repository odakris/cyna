"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CategoryForm } from "@/components/Forms/CategoryForm"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import { Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { CategoryFormSkeleton } from "@/components/Skeletons/CategorySkeletons"
import { useCategoryForm } from "@/hooks/category/use-category-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface EditCategoryPageProps {
  id: string
}

export function EditCategoryPage({ id }: EditCategoryPageProps) {
  const { category, loading, errorMessage, initialData } = useCategoryForm(id)

  if (loading) {
    return <CategoryFormSkeleton />
  }

  if (errorMessage || !category || !initialData) {
    return (
      <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
            >
              <Link href="/dashboard/categories">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">
                Modifier la Catégorie
              </h1>
              <p className="text-muted-foreground text-sm">
                Mettre à jour les informations de la catégorie
              </p>
            </div>
          </div>
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
              {errorMessage || "Catégorie introuvable"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-6">
            <Button asChild variant="outline" className="text-sm sm:text-base">
              <Link href="/dashboard/categories">
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
        <AccessDenied message="Vous n'avez pas la permission de modifier des catégories." />
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
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold">
              <span className="hidden sm:inline">Modifier la Catégorie</span>
              <span className="sm:hidden">Modifier</span>
            </h1>
            <p className="text-muted-foreground text-sm truncate">
              {category.name}
            </p>
          </div>
        </div>
        <CategoryForm
          initialData={initialData}
          isEditing={true}
          categoryId={Number(id)}
        />
      </div>
    </RoleGuard>
  )
}
