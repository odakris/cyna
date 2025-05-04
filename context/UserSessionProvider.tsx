"use client"

import { SessionProvider } from "next-auth/react"

export default function UserSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Vérifie toutes les 5 minutes (en secondes)
      refetchOnWindowFocus={false} // Ne pas vérifier lors du focus de fenêtre
    >
      {children}
    </SessionProvider>
  )
}
