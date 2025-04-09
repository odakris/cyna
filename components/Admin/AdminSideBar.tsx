"use client"

import { usePathname } from "next/navigation"
import { Home, Package, Users, ShoppingCart, List } from "lucide-react"
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
      icon: <Home className="mr-2 h-4 w-4" />,
    },
    {
      name: "Produits",
      href: "/dashboard/products",
      icon: <Package className="mr-2 h-4 w-4" />,
    },
    {
      name: "Catégories",
      href: "/dashboard/categories",
      icon: <List className="mr-2 h-4 w-4" />,
    },
    {
      name: "Utilisateurs",
      href: "/dashboard/users",
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      name: "Commandes",
      href: "/dashboard/orders",
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <aside className="bg-slate-800 text-slate-200 w-50 shrink-0 h-screen sticky top-0 left-0">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-center">Back-Office</h2>
      </div>

      <ScrollArea className="h-[calc(100vh-64px)]">
        <div className="p-4">
          <NavigationMenu orientation="vertical" className="max-w-none w-full">
            <NavigationMenuList className="flex flex-col space-y-1">
              {navLinks.map(item => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      href={item.href}
                      className={cn(
                        "flex items-center p-2 w-full rounded-md text-sm font-medium",
                        isActive
                          ? "bg-slate-700 text-slate-100"
                          : "text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}

              <NavigationMenuItem className="pt-6">
                <DisconnectButton />
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </ScrollArea>
    </aside>
  )
}
