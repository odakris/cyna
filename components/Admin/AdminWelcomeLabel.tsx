"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"

export default function AdminWelcomeLabel() {
  const { data: session, status } = useSession()
  // état local pour éviter de montrer le chargement après le premier rendu
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    // Une fois que la session est chargée, marquer comme chargé pour éviter de revoir l'état de chargement
    if (status !== "loading") {
      setHasLoaded(true)
    }
  }, [status])

  // Fonction pour obtenir les initiales à partir de l'email
  const getInitials = (email: string) => {
    if (!email) return "U"
    const parts = email.split("@")[0].split(".")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  // Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleBadgeVariant = (role: string) => {
    if (!role) return "secondary"
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive"
      case "manager":
        return "default"
      default:
        return "secondary"
    }
  }

  // Si c'est le premier chargement et que la session est en cours de chargement, afficher le placeholder
  if (!hasLoaded && status === "loading") {
    return (
      <Card className="mb-6 bg-slate-100/80">
        <CardContent className="p-4">Chargement...</CardContent>
      </Card>
    )
  }

  if (!session) {
    return (
      <Card className="mb-6 bg-slate-100/80">
        <CardContent className="p-4">Non connecté</CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 bg-slate-100/80">
      <CardContent className="flex items-center p-4">
        <Avatar className="h-10 w-10 mr-4">
          <AvatarImage
            src={session.user?.image || ""}
            alt={session.user?.email || "Utilisateur"}
          />
          <AvatarFallback className="bg-slate-700 text-slate-100">
            {session.user?.image ? "" : getInitials(session.user?.email || "U")}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="font-medium">Bienvenue dans le back-office</div>
          <div className="text-sm text-slate-500">{session.user?.email}</div>
        </div>

        <Badge
          variant={getRoleBadgeVariant(session.user?.role as string)}
          className="ml-auto"
        >
          {session.user?.role || "Utilisateur"}
        </Badge>
      </CardContent>
    </Card>
  )
}
