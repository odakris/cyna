"use client"

import { useSession } from "next-auth/react"
import PersonalInfoForm from "@/components/Account/PersonalInfoForm"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

type ExtendedUser = {
  id_user: number
  first_name: string
  last_name: string
  email: string
}

export default function EditPersonalInfoPage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/editPersonalInfo")
    }
  }, [status, router])

  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/users/${session.user.id_user}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(
            "Erreur lors de la récupération des données utilisateur"
          )
        }

        const userData = await response.json()
        setUser({
          id_user: userData.id_user,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
        })
      } catch (err) {
        setError("Une erreur est survenue lors du chargement des données.")
        console.error(err)
      }
    }

    fetchUserData()
  }, [session])

  if (status === "loading") {
    return (
      <div className="py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse space-y-4 w-full max-w-2xl">
            <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
            <div className="h-[400px] bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="py-10 text-center max-w-6xl mx-auto">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium">
            L&apos;utilisateur n&apos;est pas connecté.
          </p>
          <Button
            asChild
            variant="default"
            className="mt-4 bg-[#302082] hover:bg-[#302082]/90"
          >
            <Link href="/auth?redirect=/account/editPersonalInfo">
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-10 text-center max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4 w-full max-w-2xl mx-auto">
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto"></div>
          <div className="h-[400px] bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-3 relative pb-2 inline-block">
          Modifier mes informations
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Mettez à jour vos informations personnelles et votre mot de passe. Si
          vous modifiez votre adresse email, un message de confirmation sera
          envoyé à votre nouvelle adresse.
        </p>
      </div>

      <div className="flex flex-col items-center">
        <PersonalInfoForm user={user} />
      </div>
    </div>
  )
}
