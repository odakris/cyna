"use client"

import { useSession } from "next-auth/react"
import PersonalInfoForm from "@/components/Account/PersonalInfoForm"
import { useEffect, useState } from "react"

type User = {
  id_user: number
  first_name: string
  last_name: string
  email: string
}

export default function EditPersonalInfoPage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  if (status === "loading" || !user) {
    return <div className="py-10 text-center">Chargement...</div>
  }

  if (!session?.user) {
    return (
      <div className="py-10 text-center text-red-500">
        L&apos;utilisateur n&apos;est pas connecté.
      </div>
    )
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>
  }

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold text-center mb-6">
        Modifier mes informations
      </h1>
      <PersonalInfoForm user={user} />
    </div>
  )
}
