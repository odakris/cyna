"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Role, User } from "@prisma/client"
import { UserFormValues } from "@/lib/validations/user-schema"
import { UserForm } from "@/components/Forms/UserForm"
import { ArrowLeft } from "lucide-react"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { UserFormSkeleton } from "@/components/Skeletons/UserSkeletons"

export default function EditProductPage() {
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await fetch(`/api/users/${id}`).then(res => res.json())

        if (!userData) throw new Error("Utilisateur introuvable")

        setUser(userData)
      } catch (error) {
        console.error("Erreur fetchData:", error)
        setErrorMessage("Erreur lors du chargement des données.")
        toast({
          title: "Erreur",
          description: "Impossible de charger les données de l'utilisateur.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, toast])

  if (loading) {
    return <UserFormSkeleton />
  }

  if (errorMessage || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Modifier l&apos;utilisateur</h1>
        <p className="text-red-500">{errorMessage || "Produit introuvable"}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard/products">Retour</Link>
        </Button>
      </div>
    )
  }

  // Conversion du ProductType en ProductFormValues
  const initialData: UserFormValues = {
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    password: user.password,
    role: user.role,
    email_verified: user.email_verified,
    two_factor_enabled: user.two_factor_enabled,
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de modifier les utilisateurs." />
      }
    >
      <div className="mx-auto p-6 space-y-8 animate-in fade-in duration-300">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Modifier cet Utilisateur</h1>
        </div>
        <UserForm
          initialData={initialData}
          isEditing={true}
          userId={Number(id)}
        />
      </div>
    </RoleGuard>
  )
}
