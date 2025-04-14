"use client"

import { usePathname } from "next/navigation"
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  List,
  SlidersHorizontal,
  MessageSquareText,
  Mail,
} from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import DisconnectButton from "../DisconnectButton/DisconnectButton"
import { cn } from "@/lib/utils"

export default function AdminSideBar() {
  const pathname = usePathname()

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5 shrink-0" />,
    },
    {
      name: "Message Principal",
      href: "/dashboard/main-message",
      icon: <MessageSquareText className="h-5 w-5 shrink-0" />,
    },
    {
      name: "Hero Carousel",
      href: "/dashboard/hero-carousel",
      icon: <SlidersHorizontal className="h-5 w-5 shrink-0" />,
    },
    {
      name: "Produits",
      href: "/dashboard/products",
      icon: <Package className="h-5 w-5 shrink-0" />,
    },
    {
      name: "Catégories",
      href: "/dashboard/categories",
      icon: <List className="h-5 w-5 shrink-0" />,
    },
    {
      name: "Utilisateurs",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5 shrink-0" />,
    },
    {
      name: "Commandes",
      href: "/dashboard/orders",
      icon: <ShoppingCart className="h-5 w-5 shrink-0" />,
    },
    {
      name: "Contact",
      href: "/dashboard/contact-messages",
      icon: <Mail className="h-5 w-5 shrink-0" />,
    },
  ]

  return (
    <aside className="bg-slate-800 text-slate-200 w-64 shrink-0 h-screen sticky top-0 left-0">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-center">Back-Office</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4">
          <NavigationMenu orientation="vertical" className="max-w-none w-full">
            <NavigationMenuList className="flex flex-col space-y-2">
              {navLinks.map(item => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      href={item.href}
                      className={cn(
                        "flex items-start px-4 py-3 w-full h-12 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-slate-700 text-slate-100"
                          : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      )}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}

              <NavigationMenuItem className="pt-6">
                <div
                  className={cn(
                    "flex items-center px-4 py-3 w-full h-12 rounded-md text-sm font-medium transition-colors",
                    "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                  )}
                >
                  <DisconnectButton />
                </div>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </ScrollArea>
    </aside>
  )
}
