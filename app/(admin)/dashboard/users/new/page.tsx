import { UserForm } from "@/components/Forms/UserForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { Role } from "@prisma/client"
import { useEffect, useState } from "react"
import { UserFormSkeleton } from "@/components/Skeletons/UserSkeletons"

export default function CreateUserPage() {
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
        <AccessDenied message="Vous n'avez pas la permission de créer des utilisateurs." />
      }
    >
      {isLoading ? (
        <UserFormSkeleton />
      ) : (
        <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link href="/dashboard/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Créer un Nouvel Utilisateur</h1>
          </div>
          <UserForm />
        </div>
      )}
    </RoleGuard>
  )
}
