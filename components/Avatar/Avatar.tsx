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

  // Diviser le nom en parties et prendre la première lettre de chaque partie
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    // S'il n'y a qu'une partie, prendre les deux premières lettres
    return (parts[0].substring(0, 2) || "CY").toUpperCase()
  }

  // Sinon prendre la première lettre du prénom et du nom
  return (
    (parts[0][0] || "") + (parts[parts.length - 1][0] || "")
  ).toUpperCase()
}

export function AvatarDemo() {
  const { data: session, status } = useSession()
  const [initials, setInitials] = useState<string>("CY")
  const [isOpen, setIsOpen] = useState(false)

  // Extraire les initiales lorsque la session change
  useEffect(() => {
    if (session?.user?.name) {
      setInitials(getInitials(session.user.name))
    } else if (session?.user?.email) {
      // Si seulement l'email est disponible, utiliser la première lettre de l'email
      setInitials(session.user.email.substring(0, 2).toUpperCase())
    } else {
      setInitials("CY") // Défaut pour invité
    }
  }, [session])

  const isAuthenticated = status === "authenticated"
  const userName = session?.user?.name || session?.user?.email || "Invité"

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="rounded-full p-0 h-9 w-9 hover:bg-white/10"
          aria-label="Menu utilisateur"
        >
          <Avatar className="h-8 w-8 border-2 border-white/20">
            {isAuthenticated ? (
              // Si connecté, afficher la photo de profil si disponible
              session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={userName} />
              ) : null
            ) : (
              // Si non connecté, afficher le logo Cyna
              <AvatarImage
                src="/assets/FULL-LOGO/cyna-logo-white.png"
                alt="Logo Cyna"
              />
            )}

            {/* Fallback avec initiales ou CY */}
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
          {/* Options réservées aux utilisateurs connectés */}
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

          {/* Options pour tous les utilisateurs */}
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
            onClick={() => {
              setIsOpen(false)
              signOut()
            }}
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
