"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  // Cloud,
  CreditCard,
  // Github,
  // Keyboard,
  LifeBuoy,
  LogOut,
  // Mail,
  // MessageSquare,
  // Plus,
  // PlusCircle,
  Settings,
  // User,
  // UserPlus,
  // Users,
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
  // DropdownMenuPortal,
  DropdownMenuSeparator,
  // DropdownMenuShortcut,
  // DropdownMenuSub,
  // DropdownMenuSubContent,
  // DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"

export function AvatarDemo() {
  const { data: session } = useSession()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Settings />
            <Link href="./">Mes paramètres</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            <Link href="./">Mes Commandes</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LifeBuoy />
            <Link href="./">CGU</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Scale />
            <Link href="./">Mention légales</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BookUser />
            <Link href="./">Contact</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Store />
            <Link href="./">À propos de Cyna</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          {session?.user ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2"
            >
              <LogOut />
              <span>Se déconnecter</span>
            </button>
          ) : (
            <Link href="/auth" className="flex items-center gap-2">
              <LogIn />
              <span>Se connecter</span>
            </Link>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
