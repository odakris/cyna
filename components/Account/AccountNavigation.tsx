"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRight,
  CreditCard,
  FileText,
  Home,
  Menu,
  Package,
  Settings,
  User,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface AccountNavigationProps {
  title?: string
  showBackButton?: boolean
  backHref?: string
  backText?: string
}

export default function AccountNavigation({
  title = "Mon Compte",
  showBackButton = true,
  backHref = "/account",
  backText = "Retour",
}: AccountNavigationProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Navigation items for the menu
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
      name: "Factures",
      href: "/account/invoices",
      icon: <FileText className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Adresses",
      href: "/account/settings#addresses",
      icon: <Home className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Moyens de paiement",
      href: "/account/settings#payments",
      icon: <CreditCard className="h-5 w-5" />,
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

  // Generate breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)

    // Always start with account
    const breadcrumbs = [{ label: "Compte", href: "/account" }]

    // Add current page
    if (segments.length > 1) {
      const current = segments[segments.length - 1]

      let label = current.charAt(0).toUpperCase() + current.slice(1)

      // Custom labels for specific pages
      if (current === "orders") label = "Commandes"
      if (current === "settings") label = "Paramètres"
      if (current === "editPersonalInfo") label = "Modifier profil"
      if (current === "invoices") label = "Factures"

      breadcrumbs.push({
        label,
        href: pathname,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="bg-white border-b mb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-[#302082]">
                    Menu du compte
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-8">
                  {navigationItems.map(item => (
                    <SheetClose asChild key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center px-4 py-3 text-sm font-medium rounded-md
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
                            ${isActive(item) ? "text-[#302082]" : "text-gray-400"}
                          `}
                        >
                          {item.icon}
                        </div>
                        {item.name}
                        <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <SheetFooter className="mt-auto">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Fermer le menu
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>

            {/* Back button (visible on all screens) */}
            {showBackButton && (
              <Button asChild variant="ghost" size="sm" className="mr-4">
                <Link href={backHref}>
                  <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                  {backText}
                </Link>
              </Button>
            )}

            {/* Title and breadcrumbs */}
            <div>
              <h1 className="text-xl font-bold text-[#302082] mb-0.5">
                {title}
              </h1>
              <Breadcrumb className="hidden sm:flex">
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <BreadcrumbItem key={index}>
                      {index < breadcrumbs.length - 1 ? (
                        <>
                          <BreadcrumbLink asChild>
                            <Link
                              href={crumb.href}
                              className="text-xs text-gray-500 hover:text-[#302082]"
                            >
                              {crumb.label}
                            </Link>
                          </BreadcrumbLink>
                          <BreadcrumbSeparator />
                        </>
                      ) : (
                        <BreadcrumbLink className="text-xs text-[#302082]">
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Optional right side elements could be added here */}
        </div>
      </div>
    </div>
  )
}
