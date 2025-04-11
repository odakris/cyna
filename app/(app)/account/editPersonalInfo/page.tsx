"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import PersonalInfoForm from "@/components/Account/PersonalInfoForm"
import { Prisma } from "@prisma/client"

export default function EditPersonalInfoPage() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<Prisma.User | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          // Récupération uniquement des informations nécessaires (first_name, last_name, email, password)
          const res = await fetch(`/api/users/${session.user.id}`)
          const data = await res.json()

          if (res.ok) {
            setUser({
              id_user: data.id_user,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              password: data.password,
            })
          } else {
            setError(data.message || "Erreur lors de la récupération de l'utilisateur.")
          }
        } catch (err) {
          setError("Erreur lors de la récupération de l'utilisateur.")
          console.error("Erreur:", err)
        }
      } else {
        setError("L'utilisateur n'est pas connecté.")
      }
    }

    if (session?.user?.id) {
      fetchUser()
    }
  }, [session?.user?.id])

  if (status === "loading") {
    return <div>Chargement de la session...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!user) {
    return <div>Chargement...</div>
  }

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold text-center mb-6">Modifier mes informations</h1>
      <PersonalInfoForm user={user} />
    </div>
  )
}
