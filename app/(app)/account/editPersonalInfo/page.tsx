"use client"

import { useSession } from "next-auth/react"
import PersonalInfoForm from "@/components/Account/PersonalInfoForm"

type User = {
  id_user: number
  first_name: string
  last_name: string
  email: string
}

export default function EditPersonalInfoPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="py-10 text-center">Chargement de la session...</div>
  }

  if (!session?.user) {
    return (
      <div className="py-10 text-center text-red-500">
        L&apos;utilisateur n&apos;est pas connecté.
      </div>
    )
  }

  const user: User = {
    id_user: session.user.id_user,
    first_name: session.user.first_name,
    last_name: session.user.last_name,
    email: session.user.email,
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
