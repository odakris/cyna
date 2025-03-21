"use client"

import { signOut } from "next-auth/react"
import { Button } from "../ui/button"
import { NavigationMenuLink } from "../ui/navigation-menu"

export default function DisconnectButton() {
  return (
    <NavigationMenuLink className="block p-2 rounded-md">
      <Button variant={"cyna"} onClick={() => signOut({ callbackUrl: "/" })}>
        Déconnexion
      </Button>
    </NavigationMenuLink>
  )
}
