"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  XCircle,
  AlertTriangle,
  Home,
  RefreshCcw,
  CheckCircle,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"

const EmailVerificationErrorPage = () => {
  const [email, setEmail] = useState("")
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  // Récupérer l'email depuis les paramètres d'URL si disponible
  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else {
      // Si pas d'email dans l'URL, montrer le champ de saisie
      setShowEmailInput(true)
    }
  }, [searchParams])

  // Fonction pour renvoyer un lien de vérification
  const handleResendVerification = async () => {
    if (!email || isLoading) return

    // Validation simple de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Format invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setStatus("idle")
    setStatusMessage("")

    try {
      await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })

      setStatus("success")
      setStatusMessage(
        "Si cette adresse email est associée à un compte CYNA, un email de vérification a été envoyé."
      )
    } catch (error) {
      console.error("Erreur:", error)
      setStatus("error")
      setStatusMessage(
        "Un problème de connexion est survenu. Veuillez vérifier votre connexion internet et réessayer."
      )
      toast({
        title: "Erreur de connexion",
        description:
          "Un problème de connexion est survenu. Veuillez vérifier votre connexion internet et réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        {/* Éléments décoratifs */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>

        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <CardTitle className="text-xl text-center font-bold">
            Échec de la vérification
          </CardTitle>
        </CardHeader>

        <CardContent className="text-center pb-4">
          <div className="mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500 inline mr-2" />
            <span className="text-gray-700">
              Nous n&apos;avons pas pu vérifier votre adresse email. Le lien que
              vous avez utilisé est peut-être expiré ou invalide.
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            Vous pouvez demander un nouveau lien de vérification ou revenir à
            l&apos;accueil.
          </p>

          {showEmailInput && (
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1 text-left"
              >
                Votre adresse email
              </label>
              <div className="flex items-center">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemple@email.com"
                  className="w-full"
                  required
                />
              </div>
            </div>
          )}

          {/* Message de statut */}
          {status === "success" && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200">
              <CheckCircle className="h-5 w-5 inline mr-2" />
              {statusMessage}
            </div>
          )}

          {status === "error" && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              <AlertTriangle className="h-5 w-5 inline mr-2" />
              {statusMessage}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-2 w-full">
            <Button
              onClick={handleResendVerification}
              disabled={!email || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Renvoyer le lien
                </>
              )}
            </Button>

            <Link href="/" passHref>
              <Button variant="outline" className="w-full">
                <Home className="h-4 w-4 mr-2" />
                Retour à l&apos;accueil
              </Button>
            </Link>
          </div>
        </CardFooter>

        <div className="text-center text-gray-500 text-xs px-4 pb-4">
          <p className="mb-1">CYNA - {new Date().getFullYear()}</p>
          <p>
            Besoin d&apos;aide ?{" "}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contactez notre support
            </a>
          </p>
        </div>
      </Card>
    </div>
  )
}

export default EmailVerificationErrorPage
