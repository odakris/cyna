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
  Menu,
  X,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import DisconnectButton from "../DisconnectButton/DisconnectButton"
import { useUnreadMessagesNotification } from "@/hooks/contact-messages/use-unread-messages-notification"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { hasPermission, Permission } from "@/lib/permissions"
import { Role } from "@prisma/client"

interface AdminSideBarProps {
  role?: Role
}

export default function AdminSideBar({ role }: AdminSideBarProps) {
  const pathname = usePathname()
  const { unreadCount, hasNewMessages } = useUnreadMessagesNotification()
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Check screen size on mount and when window resizes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    // Initial check
    checkScreenSize()

    // Add resize listener
    window.addEventListener("resize", checkScreenSize)

    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Navigation links with required permissions
  const navLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      exact: true,
      requiredPermissions: ["dashboard:view"] as Permission[],
    },
    {
      name: "Message Principal",
      href: "/dashboard/main-message",
      icon: <MessageSquareText className="h-5 w-5" />,
      exact: false,
      requiredPermissions: ["main-message:view"] as Permission[],
    },
    {
      name: "Hero Carousel",
      href: "/dashboard/hero-carousel",
      icon: <SlidersHorizontal className="h-5 w-5" />,
      exact: false,
      requiredPermissions: ["hero-carousel:view"] as Permission[],
    },
    {
      name: "Produits",
      href: "/dashboard/products",
      icon: <Package className="h-5 w-5" />,
      exact: false,
      requiredPermissions: ["products:view"] as Permission[],
    },
    {
      name: "Catégories",
      href: "/dashboard/categories",
      icon: <List className="h-5 w-5" />,
      exact: false,
      requiredPermissions: ["categories:view"] as Permission[],
    },
    {
      name: "Utilisateurs",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
      exact: false,
      requiredPermissions: ["users:view"] as Permission[],
    },
    {
      name: "Commandes",
      href: "/dashboard/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
      exact: false,
      requiredPermissions: ["orders:view"] as Permission[],
    },
    {
      name: "Contact",
      href: "/dashboard/contact",
      icon: <Mail className="h-5 w-5" />,
      exact: false,
      notification: unreadCount > 0 && hasPermission(role, "contact:view"),
      notificationCount: unreadCount,
      hasNewMessages: hasNewMessages,
      requiredPermissions: ["contact:view"] as Permission[],
    },
    {
      name: "Chatbot",
      href: "/dashboard/conversations",
      icon: <BotMessageSquare className="h-5 w-5" />,
      exact: false,
      requiredPermissions: ["conversations:view"] as Permission[],
    },
  ]

  // Filter navigation links based on user permissions
  const authorizedNavLinks = navLinks.filter(item =>
    item.requiredPermissions.some(permission => hasPermission(role, permission))
  )

  const isActive = (item: { href: string; exact: boolean }) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  // Mobile toggle button that remains fixed and accessible during scrolling
  const MobileToggle = () => (
    <Button
      variant="secondary"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden shadow-md rounded-full w-10 h-10 bg-white border-2 border-primary/20 hover:bg-primary/10 transition-all"
      onClick={() => setIsOpen(!isOpen)}
      aria-label="Ouvrir le menu de navigation"
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </Button>
  )

  // Sidebar content - reused in both mobile and desktop
  const SidebarContent = () => (
    <>
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
        {authorizedNavLinks.length > 0 ? (
          <nav className="space-y-1 px-3">
            {authorizedNavLinks.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="block"
                onClick={() => isMobile && setIsOpen(false)}
              >
                <Button
                  variant={isActive(item) ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 mb-1 px-4 relative",
                    isActive(item)
                      ? "font-medium"
                      : "font-normal text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                  {item.notification && (
                    <Badge
                      variant="destructive"
                      className={cn(
                        "absolute -top-1 -right-1 px-1.5 h-5 min-w-[20px] flex items-center justify-center",
                        item.hasNewMessages && "animate-pulse bg-blue-500"
                      )}
                    >
                      {item.notificationCount > 99
                        ? "99+"
                        : item.notificationCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Aucun accès autorisé
          </div>
        )}
      </ScrollArea>
    </>
  )

  return (
    <>
      <MobileToggle />
      {/* Mobile sidebar using Sheet component from shadcn */}
      {isMobile ? (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      ) : (
        // Desktop sidebar
        <aside
          className={cn(
            "bg-card border-r h-screen fixed left-0 top-0 w-52 flex flex-col",
            "transition-transform duration-300 ease-in-out z-40",
            !isOpen && "-translate-x-full md:translate-x-0"
          )}
        >
          <SidebarContent />
        </aside>
      )}
    </>
  )
}
