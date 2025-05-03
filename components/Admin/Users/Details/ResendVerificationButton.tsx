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
        // Ajouter les données nécessaires dans le corps de la requête
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
      // Réinitialiser le statut après 3 secondes
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  return (
    <Button onClick={handleResendVerification} disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Envoi en cours...
        </>
      ) : status === "success" ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Email envoyé
        </>
      ) : status === "error" ? (
        <>
          <XCircle className="mr-2 h-4 w-4" />
          Échec de l&apos;envoi
        </>
      ) : (
        <>
          <Mail className="mr-2 h-4 w-4" />
          Renvoyer l&apos;email de vérification
        </>
      )}
    </Button>
  )
}
