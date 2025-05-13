"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  CreditCard,
  LifeBuoy,
  LogOut,
  Settings,
  BookUser,
  Store,
  Scale,
  LogIn,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

// Fonction pour obtenir les initiales d'un nom
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "CY"

  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return (parts[0].substring(0, 2) || "CY").toUpperCase()
  }

  return (
    (parts[0][0] || "") + (parts[parts.length - 1][0] || "")
  ).toUpperCase()
}

export function AvatarDemo() {
  const { data: session, status } = useSession()
  const [initials, setInitials] = useState<string>("CY")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.name) {
      setInitials(getInitials(session.user.name))
    } else if (session?.user?.email) {
      setInitials(session.user.email.substring(0, 2).toUpperCase())
    } else {
      setInitials("CY")
    }
  }, [session])

  const isAuthenticated = status === "authenticated"
  const userName = session?.user?.name || session?.user?.email || "Invité"

  const handleSignOut = async () => {
    try {
      console.log("[AvatarDemo] Déclenchement de la déconnexion")

      // Vider le localStorage
      localStorage.clear() // Vide tout le localStorage
      // OU, si vous voulez supprimer des clés spécifiques :
      // localStorage.removeItem("maCleSpecifique");

      console.log("[AvatarDemo] localStorage vidé")

      // Appeler la déconnexion avec next-auth
      await signOut({ callbackUrl: "/auth" })
      console.log("[AvatarDemo] Déconnexion réussie, redirection vers /auth")
    } catch (error) {
      console.error("[AvatarDemo] Erreur lors de la déconnexion", error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full p-0 h-9 w-9 hover:bg-white/10"
          aria-label="Menu utilisateur"
        >
          <Avatar className="h-8 w-8 border-2 border-white/20">
            {isAuthenticated && session?.user?.image ? (
              <AvatarImage src={session.user.image} alt={userName} />
            ) : null}
            <AvatarFallback
              className={
                isAuthenticated
                  ? "bg-[#FF6B00] text-white"
                  : "bg-[#302082] text-white"
              }
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56 mr-2 mt-1" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session?.user?.email ||
                "Connectez-vous pour accéder à votre compte"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {isAuthenticated && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href="/account/settings"
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Mes paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/account/orders"
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Mes commandes</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem asChild>
            <Link
              href="/mentions-legales"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Scale className="mr-2 h-4 w-4" />
              <span>Mentions légales</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/mentions-legales#cgu"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>CGU</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/contact"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <BookUser className="mr-2 h-4 w-4" />
              <span>Contact</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/about"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <Store className="mr-2 h-4 w-4" />
              <span>À propos de Cyna</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {isAuthenticated ? (
          <DropdownMenuItem
            className="text-red-500 focus:text-red-500 cursor-pointer"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Se déconnecter</span>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link
              href="/auth"
              className="flex items-center gap-2 text-[#302082] font-medium cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              <span>Se connecter</span>
            </Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
