"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Key,
  Shield,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Token manquant. Veuillez utiliser le lien envoyé par e-mail.")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setError(null)
    setLoading(true)

    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage(
          "Mot de passe réinitialisé avec succès. Redirection vers la connexion..."
        )
        setTimeout(() => router.push("/auth"), 3000)
      } else {
        throw new Error(
          result.error || "Une erreur est survenue lors de la réinitialisation."
        )
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 animate-in fade-in duration-300">
      <Card className="border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#302082] to-[#FF6B00]"></div>

        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold text-[#302082]">
            Réinitialiser le mot de passe
          </CardTitle>
          <CardDescription className="text-gray-500">
            Créez un nouveau mot de passe sécurisé pour votre compte
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && (
            <div className="mb-4 bg-green-50 p-3 rounded-md flex items-start gap-2 text-green-600 text-sm border border-green-200">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-600 text-sm border border-red-200">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="text-sm font-semibold text-[#302082] flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Nouveau mot de passe
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                disabled={loading || !token}
                className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                placeholder="••••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">
                Utilisez au moins 8 caractères avec des lettres et des chiffres
              </p>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-[#302082] flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Confirmer le mot de passe
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={loading || !token}
                className="bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#302082] focus-visible:ring-1 focus-visible:ring-[#302082] transition-colors"
                placeholder="••••••••••"
              />
            </div>

            <Button
              className="w-full bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-all duration-300 text-sm font-semibold py-5 mt-2"
              disabled={loading || !token}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Réinitialisation en cours...
                </>
              ) : (
                "Réinitialiser mon mot de passe"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t pt-4">
          <Link
            href="/auth"
            className="text-sm text-[#302082] hover:text-[#FF6B00] transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
