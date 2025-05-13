"use client"

import { ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  CreditCard,
  Home,
  Package,
  Settings,
  User,
  Loader2,
  FileText,
} from "lucide-react"

interface AccountLayoutProps {
  children: ReactNode
}

export default function AccountLayout({ children }: AccountLayoutProps) {
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

  // Navigation items for the sidebar
  const navigationItems = [
    {
      name: "Tableau de bord",
      href: "/account",
      icon: <User className="h-5 w-5" />,
      exact: true,
    },
    {
      name: "Commandes",
      href: "/account/orders",
      icon: <Package className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Adresses",
      href: "/account/settings#addresses",
      icon: <Home className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Paiements",
      href: "/account/settings#payments",
      icon: <CreditCard className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Abonnements",
      href: "/account/settings#subscriptions",
      icon: <FileText className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Paramètres",
      href: "/account/settings",
      icon: <Settings className="h-5 w-5" />,
      exact: true,
    },
  ]

  // Check if an item is active
  const isActive = (item: { href: string; exact: boolean }) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href.split("#")[0])
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for larger screens */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold text-[#302082]">Mon Compte</h2>
            <p className="text-sm text-gray-500 mt-1">
              {session.user?.first_name} {session.user?.last_name}
            </p>
          </div>

          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigationItems.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md
                  ${
                    isActive(item)
                      ? "bg-[#302082]/10 text-[#302082]"
                      : "text-gray-600 hover:bg-gray-100"
                  }
                `}
              >
                <div
                  className={`
                    mr-3 flex-shrink-0
                    ${isActive(item) ? "text-[#302082]" : "text-gray-400 group-hover:text-gray-500"}
                  `}
                >
                  {item.icon}
                </div>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile top navigation */}
      <div className="md:hidden bg-white w-full border-b fixed top-0 z-10 px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#302082]">Mon Compte</h1>

        <div className="w-14">
          {/* Placeholder to balance the flex layout */}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden bg-white w-full border-t fixed bottom-0 z-10">
        <nav className="flex justify-around">
          {navigationItems.slice(0, 5).map(item => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center py-2 px-1 text-xs
                ${isActive(item) ? "text-[#302082]" : "text-gray-500"}
              `}
            >
              <div className="mb-1">{item.icon}</div>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 relative pb-16 md:py-0">
        <div className="p-0 pt-16 md:pt-0 md:p-6">{children}</div>
      </main>
    </div>
  )
}
