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
  BotMessageSquare,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import DisconnectButton from "../DisconnectButton/DisconnectButton"

export default function AdminSideBar() {
  const pathname = usePathname()

  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      exact: true,
    },
    {
      name: "Message Principal",
      href: "/dashboard/main-message",
      icon: <MessageSquareText className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Hero Carousel",
      href: "/dashboard/hero-carousel",
      icon: <SlidersHorizontal className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Produits",
      href: "/dashboard/products",
      icon: <Package className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Catégories",
      href: "/dashboard/categories",
      icon: <List className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Utilisateurs",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Commandes",
      href: "/dashboard/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Contact",
      href: "/dashboard/contact",
      icon: <Mail className="h-5 w-5" />,
      exact: false,
    },
    {
      name: "Chatbot",
      href: "/dashboard/conversations",
      icon: <BotMessageSquare className="h-5 w-5" />,
      exact: false,
    },
  ]

  const isActive = (item: { href: string; exact: boolean }) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return (
    <aside className="bg-card border-r h-screen fixed left-0 top-0 w-52 flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-center text-primary">
          CYNA Admin
        </h2>
      </div>
      <div className="p-4">
        <DisconnectButton />
      </div>
      <Separator />
      <ScrollArea className="flex-1 py-2">
        <nav className="space-y-1 px-3">
          {navLinks.map(item => (
            <Link key={item.name} href={item.href} className="block">
              <Button
                variant={isActive(item) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-12 mb-1 px-4",
                  isActive(item)
                    ? "font-medium"
                    : "font-normal text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Button>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  )
}
