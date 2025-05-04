"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarClock, User } from "lucide-react"

export default function AdminWelcomeLabel() {
  const { data: session, status } = useSession()
  const [hasLoaded, setHasLoaded] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (status !== "loading") {
      setHasLoaded(true)
    }
  }, [status])

  useEffect(() => {
    // Mettre à jour la date toutes les minutes
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Formater la date en français
  const formatDate = () => {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(currentDate)
  }

  // Fonction pour obtenir les initiales à partir de l'email ou du nom
  const getInitials = () => {
    if (!session?.user) return "?"

    if (session.user.name) {
      const nameParts = session.user.name.split(" ")
      if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      }
      return session.user.name.substring(0, 2).toUpperCase()
    }

    if (session.user.email) {
      const parts = session.user.email.split("@")[0].split(".")
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return session.user.email.substring(0, 2).toUpperCase()
    }

    return "?"
  }

  // Si c'est le premier chargement et que la session est en cours de chargement, afficher le skeleton
  if (!hasLoaded && status === "loading") {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 gap-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    )
  }

  // Pas de session
  if (!session) {
    return (
      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12 border">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Non connecté</p>
              <p className="text-sm text-muted-foreground">
                Veuillez vous connecter
              </p>
            </div>
          </div>
          <Button variant="outline" asChild className="mt-4 md:mt-0">
            <a href="/login">Se connecter</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Affichage normal avec session
  return (
    <Card className="mb-6">
      <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12 border">
            <AvatarImage
              src={session.user?.image || ""}
              alt={session.user?.name || session.user?.email || "Utilisateur"}
            />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-lg">
              Bienvenue,{" "}
              {session.user?.name || session.user?.email?.split("@")[0]}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {session.user?.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
          <div className="text-sm text-muted-foreground flex items-center gap-1 md:mr-3 order-2 md:order-1">
            <CalendarClock className="h-4 w-4" />
            <span className="capitalize hidden sm:inline">{formatDate()}</span>
            <span className="capitalize inline sm:hidden">
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }).format(currentDate)}
            </span>
          </div>
          <Badge
            variant="outline"
            className={`px-3 py-1 order-1 md:order-2 self-start md:self-auto ${
              session.user?.role?.toLowerCase() === "admin"
                ? "bg-red-100 text-red-800 border-red-200"
                : session.user?.role?.toLowerCase() === "super_admin"
                  ? "bg-purple-100 text-purple-800 border-purple-200"
                  : "bg-blue-100 text-blue-800 border-blue-200"
            }`}
          >
            {session.user?.role || "Utilisateur"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
