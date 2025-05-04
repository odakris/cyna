"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ResendVerificationButtonProps {
  email?: string
  userId?: number
}

export const ResendVerificationButton = ({
  email,
  userId,
}: ResendVerificationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleResendVerification = async () => {
    if (isLoading) return

    setIsLoading(true)
    setStatus("idle")

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Échec de l'envoi")
      }

      setStatus("success")
      toast({
        title: "Email envoyé",
        description: `Un email de vérification a été envoyé à ${email || "l'utilisateur"}`,
        variant: "success",
      })
    } catch (error) {
      console.error("Erreur:", error)
      setStatus("error")
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de vérification",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <Button
      onClick={handleResendVerification}
      disabled={isLoading}
      className="h-9 sm:h-10 text-xs sm:text-sm"
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
          <Mail className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">
            Renvoyer l&apos;email de vérification
          </span>
          <span className="sm:hidden">Renvoyer</span>
        </>
      )}
    </Button>
  )
}
