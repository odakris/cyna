import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CategoryForm } from "@/components/Forms/CategoryForm"
import { ArrowLeft } from "lucide-react"
import { Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"

export function CreateCategoryPage() {
  return (
    <RoleGuard
      requiredRole={Role.MANAGER}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de créer des catégories." />
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
          <h1 className="text-xl sm:text-3xl font-bold">
            <span className="hidden sm:inline">
              Créer une Nouvelle Catégorie
            </span>
            <span className="sm:hidden">Nouvelle Catégorie</span>
          </h1>
        </div>
        <CategoryForm />
      </div>
    </RoleGuard>
  )
}
