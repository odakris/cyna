"use client"

import { useEffect } from "react"
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
import {
  User,
  Home,
  CreditCard,
  Settings,
  Package,
  ShoppingBag,
  Shield,
} from "lucide-react"

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Rediriger vers la page de connexion si non connecté
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 w-48 bg-gray-200 rounded mx-auto mb-2"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null // Cette partie ne sera normalement pas rendue grâce à la redirection
  }

  const menuItems = [
    {
      title: "Informations personnelles",
      description: "Modifier vos données personnelles et votre mot de passe",
      icon: <User className="h-5 w-5" />,
      href: "/account/editPersonalInfo",
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Adresses",
      description: "Gérer vos adresses de livraison et facturation",
      icon: <Home className="h-5 w-5" />,
      href: "/account/settings#addresses",
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Moyens de paiement",
      description: "Ajouter ou modifier vos moyens de paiement",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/account/settings#payments",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Commandes",
      description: "Consulter l'historique de vos commandes",
      icon: <Package className="h-5 w-5" />,
      href: "/account/orders",
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Abonnements",
      description: "Gérer vos abonnements actifs",
      icon: <ShoppingBag className="h-5 w-5" />,
      href: "/account/settings#subscriptions",
      color: "bg-rose-100 text-rose-600",
    },
    {
      title: "Paramètres généraux",
      description: "Gérer tous vos paramètres",
      icon: <Settings className="h-5 w-5" />,
      href: "/account/settings",
      color: "bg-gray-100 text-gray-600",
    },
  ]

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      {/* En-tête du compte */}
      <div className="mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-3 relative pb-2 inline-block">
          Mon compte
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Gérez vos informations personnelles, adresses, moyens de paiement et
          accédez à l&apos;historique de vos commandes.
        </p>
      </div>

      {/* Carte profil utilisateur */}
      <Card className="mb-8 border-2 border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#302082] via-[#5845B9] to-[#FF6B00]"></div>

        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#302082]">
            Profil
          </CardTitle>
          <CardDescription>Informations de votre compte</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Avatar className="h-24 w-24 border-2 border-[#302082]/20">
              <AvatarImage
                src={session.user.avatar_url || ""}
                alt={`${session.user.first_name || ""} ${session.user.last_name || ""}`}
              />
              <AvatarFallback className="bg-[#302082]/10 text-[#302082] text-xl">
                {session.user.first_name?.charAt(0) || ""}
                {session.user.last_name?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>

            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold">
                {session.user.first_name || ""} {session.user.last_name || ""}
              </h2>
              <p className="text-gray-600 mb-2">{session.user.email || ""}</p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="bg-[#302082] hover:bg-[#302082]/90"
                >
                  <Link href="/account/editPersonalInfo">
                    <User className="mr-1 h-4 w-4" />
                    Modifier le profil
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grille de navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href} className="block">
            <Card className="h-full hover:shadow-md hover:border-[#302082]/30 transition-all duration-300">
              <CardHeader className="pb-2">
                <div
                  className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center mb-2`}
                >
                  {item.icon}
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{item.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="ghost"
                  className="text-[#302082] hover:text-[#302082] hover:bg-[#302082]/10 -ml-2"
                >
                  Accéder
                </Button>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {/* Bannière de support */}
      <div className="mt-10 bg-gradient-to-r from-[#302082] to-[#231968] rounded-xl p-6 text-white text-center shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">
                Besoin d&apos;aide avec votre compte ?
              </h3>
              <p className="text-white/80">
                Notre équipe support est disponible 24/7
              </p>
            </div>
          </div>
          <Button asChild className="bg-white text-[#302082] hover:bg-white/90">
            <Link href="/contact">Contacter le support</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
