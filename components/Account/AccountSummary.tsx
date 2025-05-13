"use client"

import React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  CreditCard,
  FileText,
  Home,
  Package,
  Settings,
  User,
  ChevronRight,
  Clock,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface AccountSummaryProps {
  ordersCount?: number
  addressesCount?: number
  paymentsCount?: number
  subscriptionsCount?: number
}

export default function AccountSummary({
  ordersCount = 0,
  addressesCount = 0,
  paymentsCount = 0,
  subscriptionsCount = 0,
}: AccountSummaryProps) {
  const { data: session } = useSession()

  const navigationItems = [
    {
      name: "Commandes",
      description: "Historique et suivi de vos commandes",
      icon: <Package className="h-5 w-5" />,
      href: "/account/orders",
      count: ordersCount,
      countLabel: `${ordersCount} commande${ordersCount !== 1 ? "s" : ""}`,
    },
    {
      name: "Factures",
      description: "Accédez à toutes vos factures",
      icon: <FileText className="h-5 w-5" />,
      href: "/account/invoices",
      count: ordersCount, // Typically same as orders
      countLabel: `${ordersCount} facture${ordersCount !== 1 ? "s" : ""}`,
    },
    {
      name: "Adresses",
      description: "Gérez vos adresses de livraison et facturation",
      icon: <Home className="h-5 w-5" />,
      href: "/account/settings#addresses",
      count: addressesCount,
      countLabel: `${addressesCount} adresse${addressesCount !== 1 ? "s" : ""}`,
    },
    {
      name: "Moyens de paiement",
      description: "Gérez vos cartes bancaires et méthodes de paiement",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/account/settings#payments",
      count: paymentsCount,
      countLabel: `${paymentsCount} carte${paymentsCount !== 1 ? "s" : ""}`,
    },
    {
      name: "Abonnements",
      description: "Gérez vos services et abonnements actifs",
      icon: <Clock className="h-5 w-5" />,
      href: "/account/settings#subscriptions",
      count: subscriptionsCount,
      countLabel: `${subscriptionsCount} abonnement${subscriptionsCount !== 1 ? "s" : ""}`,
    },
    {
      name: "Paramètres",
      description: "Modifiez vos préférences de compte",
      icon: <Settings className="h-5 w-5" />,
      href: "/account/settings",
    },
  ]

  if (!session?.user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 md:p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-[#302082]/20">
            <AvatarImage
              src={session.user.avatar_url || ""}
              alt={`${session.user.first_name || ""} ${session.user.last_name || ""}`}
            />
            <AvatarFallback className="bg-[#302082]/10 text-[#302082] text-xl">
              {session.user.first_name?.charAt(0) || ""}
              {session.user.last_name?.charAt(0) || ""}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-semibold">
              {session.user.first_name || ""} {session.user.last_name || ""}
            </h2>
            <p className="text-gray-600">{session.user.email || ""}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="bg-[#302082]/5 text-[#302082]"
              >
                <User className="h-3 w-3 mr-1" />
                Client
              </Badge>

              {subscriptionsCount > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Abonné
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Link
          href="/account/editPersonalInfo"
          className="inline-flex items-center justify-center py-2 px-4 text-sm font-medium text-[#302082] bg-[#302082]/5 rounded-md hover:bg-[#302082]/10 transition-colors"
        >
          Modifier le profil
          <ChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {navigationItems.map(item => (
          <Link key={item.name} href={item.href} className="block">
            <Card className="h-full hover:border-[#302082]/30 hover:shadow-md transition-all duration-300 flex flex-col">
              <div className="p-5 flex-grow">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-md bg-[#302082]/10 text-[#302082]">
                    {item.icon}
                  </div>

                  {item.count !== undefined && (
                    <Badge variant="outline">{item.countLabel}</Badge>
                  )}
                </div>

                <h3 className="font-semibold text-[#302082] mb-1">
                  {item.name}
                </h3>

                <p className="text-sm text-gray-600">{item.description}</p>
              </div>

              <div className="p-4 border-t bg-gray-50/50 flex justify-end">
                <div className="text-[#302082] text-sm font-medium flex items-center">
                  Accéder
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="p-4 md:p-6 bg-[#302082]/5 rounded-lg border border-[#302082]/20">
        <h3 className="font-semibold text-[#302082] mb-2">
          Besoin d&apos;aide avec votre compte ?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Notre équipe de support est à votre disposition pour répondre à toutes
          vos questions concernant votre compte CYNA.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center py-2 px-4 text-sm font-medium text-white bg-[#302082] rounded-md hover:bg-[#302082]/90 transition-colors"
        >
          Contacter le support
        </Link>
      </div>
    </div>
  )
}
