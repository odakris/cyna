"use client"

import { signOut } from "next-auth/react"
import { Button } from "../ui/button"
import { LogOutIcon } from "lucide-react"

export default function DisconnectButton() {
  return (
    <Button
      variant="cyna"
      className="w-full justify-start"
      onClick={() => signOut({ callbackUrl: "/auth" })}
    >
      <LogOutIcon className="mr-2 h-4 w-4" />
      Déconnexion
    </Button>
  )
}
