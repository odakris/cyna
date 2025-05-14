"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertTriangle, Edit, User } from "lucide-react"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clientInfo, setClientInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/settings/profile")
    }
  }, [status, router])

  // Fetch user data
  useEffect(() => {
    if (!session?.user?.id_user) return

    const fetchClientData = async () => {
      setError(null)
      setLoading(true)

      try {
        const response = await fetch(`/api/users/${session.user.id_user}`, {
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message ||
              "Erreur lors de la récupération des informations utilisateur"
          )
        }

        const userData = await response.json()
        setClientInfo(userData)
      } catch (err) {
        setError(
          (err as Error).message ||
            "Une erreur est survenue lors de la récupération des données utilisateur."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [session])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <Card className="border-2 border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-100 rounded"></div>
          </CardHeader>
          <CardContent className="pt-6 pb-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-4 w-full">
                <div className="h-6 w-48 bg-gray-200 rounded mx-auto md:mx-0"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mx-auto md:mx-0"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t bg-gray-50/50 justify-end">
            <div className="h-10 w-48 bg-gray-200 rounded"></div>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
        <div>
          <p className="font-medium text-red-600">Vous devez être connecté</p>
          <p className="text-sm text-red-600">
            Connectez-vous pour accéder à cette page
          </p>
          <Button
            asChild
            variant="default"
            className="mt-2 bg-[#302082] hover:bg-[#302082]/90"
          >
            <Link href="/auth?redirect=/account/settings/profile">
              Se connecter
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b">
        <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
          <User className="h-5 w-5" />
          Informations personnelles
        </CardTitle>
        <CardDescription>
          Gérez vos informations personnelles et vos préférences
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-4">
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-24 w-24 border-2 border-[#302082]/20">
            <AvatarImage
              src={clientInfo?.avatar_url || ""}
              alt={`${clientInfo?.first_name || ""} ${clientInfo?.last_name || ""}`}
            />
            <AvatarFallback className="bg-[#302082]/10 text-[#302082] text-xl">
              {clientInfo?.first_name?.charAt(0) || ""}
              {clientInfo?.last_name?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-4 w-full text-center md:text-left">
            <div>
              <h3 className="text-lg font-semibold">
                {clientInfo?.first_name || ""} {clientInfo?.last_name || ""}
              </h3>
              <p className="text-gray-600">{clientInfo?.email || ""}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-500">
                  Date d&apos;inscription
                </div>
                <div>
                  {clientInfo?.created_at
                    ? new Date(clientInfo.created_at).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-sm font-medium text-gray-500">
                  Dernière connexion
                </div>
                <div>
                  {clientInfo?.last_login
                    ? new Date(clientInfo.last_login).toLocaleDateString()
                    : "Aujourd'hui"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-gray-50/50 justify-end">
        <Button
          asChild
          className="bg-[#302082] hover:bg-[#302082]/90 text-white"
        >
          <Link href="/account/editPersonalInfo">
            <Edit className="mr-2 h-4 w-4" />
            Modifier mes informations
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
