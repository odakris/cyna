"use client"

import { useSession } from "next-auth/react"

export default function AdminWelcomeLabel() {
  const { data: session } = useSession()
  return (
    <p className="mb-4">
      Bienvenue dans le back-office, {session?.user?.email} ! Rôle :{" "}
      {session?.user?.role}
    </p>
  )
}
