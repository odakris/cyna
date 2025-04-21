"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { User } from "@prisma/client"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Edit,
  User as UserIcon,
  Calendar,
  Mail,
  Key,
  CheckCircle,
  XCircle,
  LockKeyhole,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserDetailSkeleton } from "@/components/Skeletons/UserSkeletons"

export default function UserDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData: User = await fetch(`/api/users/${id}`).then(res =>
          res.json()
        )
        console.log("Données reçues:", userData) // Debug

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

  const handleEdit = () => {
    router.push(`/dashboard/users/${id}/edit`)
  }

  // Fonction pour déterminer la couleur du badge selon le rôle
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "ADMIN":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "MANAGER":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "CUSTOMER":
      default:
        return "bg-green-100 text-green-800 hover:bg-green-200"
    }
  }

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (loading) {
    return <UserDetailSkeleton />
  }

  if (errorMessage || !user) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Détails de l&apos;utilisateur</h1>
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/50">
                <UserIcon className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-xl text-red-600">Erreur</CardTitle>
              <CardDescription className="text-red-600">
                {errorMessage || "Utilisateur introuvable"}
              </CardDescription>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à la liste
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/dashboard/users">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Détails de l&apos;Utilisateur</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </div>
      </div>

      {/* User Card */}
      <Card className="overflow-hidden border-border/40 shadow-lg">
        <CardHeader className="flex flex-row justify-between items-start p-6 pb-0 bg-muted/20">
          <div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="text-md">
                <Mail className="inline mr-1 h-4 w-4" /> {user.email}
              </CardDescription>
            </div>
            <Badge className={`px-3 py-1 my-3 ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </Badge>
          </div>

          <div className="text-right">
            <p className="text-xl text-muted-foreground">Statut</p>
            <Badge
              variant={user.email_verified ? "default" : "destructive"}
              className="py-1 px-3"
            >
              {user.email_verified ? "Vérifié" : "Non vérifié"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-6">
          {/* Avatar/Profile Section */}
          <div className="flex flex-col justify-center items-center bg-muted/30 rounded-lg p-8">
            <Avatar className="h-36 w-36 mb-4 border-4 border-background shadow-lg">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.first_name}%20${user.last_name}&backgroundColor=4f46e5`}
                alt={`${user.first_name} ${user.last_name}`}
              />
              <AvatarFallback className="text-2xl font-bold">
                {getUserInitials(user.first_name, user.last_name)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold mt-4">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
            <Badge className={`px-3 py-1 mt-3 ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </Badge>
          </div>

          {/* User Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Informations du compte
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Détails et paramètres de l&apos;utilisateur dans le système.
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Authentification à deux facteurs
                  </p>
                  <p className="font-semibold flex items-center">
                    <LockKeyhole className="mr-2 h-4 w-4 text-muted-foreground" />
                    {user.two_factor_enabled ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" /> Activée
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="mr-1 h-4 w-4" /> Désactivée
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Adresse email vérifiée
                  </p>
                  <p className="font-semibold flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                    {user.email_verified ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="mr-1 h-4 w-4" /> Vérifiée
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <XCircle className="mr-1 h-4 w-4" /> Non vérifiée
                      </span>
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Date d&apos;inscription
                  </p>
                  <p className="font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Dernière mise à jour
                  </p>
                  <p className="font-medium flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Accès et Sécurité */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Accès et sécurité</h3>
              <Button variant="outline" size="sm">
                <Key className="mr-2 h-4 w-4" />
                Réinitialiser le mot de passe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
