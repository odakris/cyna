"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CreditCard, Home, Clock, User, Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  // Redirection if not authenticated
  useEffect(() => {
    if (status === "loading") {
      return
    }

    if (status === "unauthenticated") {
      router.push(`/auth?redirect=${pathname}`)
    } else {
      setLoading(false)
    }
  }, [status, router, pathname])

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname.includes("/account/addresses")) return "addresses" // Capturer les anciennes URLs aussi
    if (pathname.includes("/settings/addresses")) return "addresses"
    if (pathname.includes("/account/payments")) return "payments" // Capturer les anciennes URLs aussi
    if (pathname.includes("/settings/payments")) return "payments"
    if (pathname.includes("/settings/subscriptions")) return "subscriptions"
    return "profile" // Default tab is profile
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    // Pour les anciennes URLs d'édition d'adresse et de paiement, ne pas rediriger
    if (pathname.includes("/addresses/") || pathname.includes("/payments/")) {
      return
    }
    router.push(`/account/settings/${value}`)
  }

  // If loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#302082]" />
          <p className="mt-2 text-[#302082] font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  // If not authenticated (though this should redirect)
  if (!session) {
    return null
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] mb-3 relative pb-2 inline-block">
          Paramètres du compte
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <p className="text-gray-600 max-w-3xl">
          Gérez vos informations personnelles, adresses, moyens de paiement et
          abonnements.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="mb-6">
        <Tabs value={getActiveTab()} onValueChange={handleTabChange}>
          <TabsList className="w-full flex overflow-x-auto hide-scrollbar bg-gray-100 p-1 rounded-md h-auto">
            <TabsTrigger
              value="profile"
              className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#302082] data-[state=active]:shadow-sm rounded-sm"
            >
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#302082] data-[state=active]:shadow-sm rounded-sm"
            >
              <Home className="h-4 w-4 mr-2" />
              Adresses
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#302082] data-[state=active]:shadow-sm rounded-sm"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Paiements
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="flex-1 py-2.5 data-[state=active]:bg-white data-[state=active]:text-[#302082] data-[state=active]:shadow-sm rounded-sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              Abonnements
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main content */}
      <div>{children}</div>
    </div>
  )
}
