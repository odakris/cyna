"use client"

// CreateCategoryPage.tsx
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CategoryForm } from "@/components/Forms/CategoryForm"

export default function CreateCategoryPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
            <div>
              <h1 className="text-3xl font-bold">Nouvelle Catégorie</h1>
              <p className="text-muted-foreground">
                Créer une nouvelle catégorie pour vos produits
              </p>
            </div>
          </div>
        </div>
      </div>

      <CategoryForm />
    </div>
  )
}
