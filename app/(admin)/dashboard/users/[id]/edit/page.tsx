"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { User } from "@prisma/client"
import { UserFormValues } from "@/lib/validations/user-schema"
import { UserForm } from "../../../../../../components/Forms/UserForm"

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
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
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
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Modifier les informations</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            initialData={initialData}
            isEditing={true}
            userId={Number(id)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
