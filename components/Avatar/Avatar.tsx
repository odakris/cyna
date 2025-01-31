import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Cloud,
  CreditCard,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  User,
  UserPlus,
  Users,
  BookUser,
  Store,
  Scale,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function AvatarDemo() {
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
          <LogOut />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
