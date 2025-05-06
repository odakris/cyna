"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { KeyRound, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SendPasswordResetButtonProps {
  email?: string
  userId?: number
}

export const SendPasswordResetButton = ({
  email,
  userId,
}: SendPasswordResetButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleSendResetLink = async () => {
    if (isLoading || !email) return

    setIsLoading(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          adminRequest: true,
          userId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Échec de l'envoi")
      }

      setStatus("success")
      toast({
        title: "Email envoyé",
        description: `Un email de réinitialisation de mot de passe a été envoyé à ${email}`,
        variant: "success",
      })
    } catch (error) {
      console.error("Erreur:", error)
      setStatus("error")
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <Button
      onClick={handleSendResetLink}
      disabled={isLoading || !email}
      className="h-9 sm:h-10 text-xs sm:text-sm"
      variant="outline"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
          <span className="sm:inline">Envoi en cours...</span>
        </>
      ) : status === "success" ? (
        <>
          <CheckCircle className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sm:inline">Email envoyé</span>
        </>
      ) : status === "error" ? (
        <>
          <XCircle className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sm:inline">Échec de l&apos;envoi</span>
        </>
      ) : (
        <>
          <KeyRound className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">
            Envoyer un lien de réinitialisation de mot de passe
          </span>
          <span className="sm:hidden">Réinitialisation</span>
        </>
      )}
    </Button>
  )
}
