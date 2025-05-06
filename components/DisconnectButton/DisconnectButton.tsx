"use client";

import { signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { LogOutIcon } from "lucide-react";

export default function DisconnectButton() {
  const handleSignOut = async () => {
    try {
      console.log("[DisconnectButton] Déclenchement de la déconnexion");
      await signOut({ callbackUrl: "/auth" });
      console.log("[DisconnectButton] Déconnexion réussie, redirection vers /auth");
    } catch (error) {
      console.error("[DisconnectButton] Erreur lors de la déconnexion", error);
    }
  };

  return (
    <Button
      variant="cyna"
      className="w-full justify-start"
      onClick={handleSignOut}
    >
      <LogOutIcon className="mr-2 h-4 w-4" />
      Déconnexion
    </Button>
  );
}