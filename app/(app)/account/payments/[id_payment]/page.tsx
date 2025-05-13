"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PaymentMethodsForm } from "@/components/Account/PaymentMethodsForm"
import StripeWrapper from "@/components/StripeWrapper"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function EditPaymentMethodPage() {
  const { id_payment } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/payments")
    }
  }, [status, router])

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      if (id_payment && session?.user?.id_user) {
        try {
          const response = await fetch(
            `/api/users/${session.user.id_user}/payments/${id_payment}`
          )
          const data = await response.json()
          if (response.ok) {
            setPaymentMethod(data)
          } else {
            setErrorMessage(
              data.message ||
                "Erreur lors de la récupération de la méthode de paiement."
            )
          }
        } catch {
          setErrorMessage(
            "Une erreur est survenue lors de la récupération de la méthode de paiement."
          )
        }
      }
    }

    if (session) {
      fetchPaymentMethod()
    }
  }, [id_payment, session])

  const checkPassword = async (password: string) => {
    try {
      const response = await fetch("/api/check-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      return data.isValid
    } catch {
      return false
    }
  }

  const handleUpdate = async (newPaymentMethod: any) => {
    if (!password) {
      setPasswordError("Le mot de passe est requis.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const isPasswordValid = await checkPassword(password)
    if (!isPasswordValid) {
      setPasswordError("Mot de passe incorrect.")
      setLoading(false)
      return
    }

    setPasswordError(null)

    if (!session?.user?.id_user) {
      setErrorMessage(
        "Vous devez être connecté pour modifier une méthode de paiement."
      )
      setLoading(false)
      return
    }

    if (!newPaymentMethod || Object.keys(newPaymentMethod).length === 0) {
      setErrorMessage(
        "Les données de la nouvelle méthode de paiement sont invalides ou manquantes."
      )
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `/api/users/${session.user.id_user}/payments/${id_payment}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newPaymentMethod),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ||
            "Échec de la mise à jour de la méthode de paiement."
        )
      }

      router.push("/account/settings")
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Une erreur est survenue lors de la mise à jour de la méthode de paiement."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <p className="font-medium text-red-600">Vous devez être connecté</p>
            <p className="text-sm text-red-600">
              Connectez-vous pour accéder à cette page
            </p>
            <Button
              asChild
              variant="default"
              className="mt-2 bg-[#302082] hover:bg-[#302082]/90"
            >
              <Link href="/auth?redirect=/account/settings">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!paymentMethod) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <StripeWrapper>
      <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] relative pb-2 inline-block">
              Modifier le moyen de paiement
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
            </h1>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Mettez à jour les informations de votre carte bancaire. Pour
            confirmer, nous vous demanderons votre mot de passe.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mot de passe actuel <span className="text-red-500">*</span>
          </label>
          <div className="relative max-w-md">
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className={`mt-1 block w-full border ${passwordError ? "border-red-500" : "border-gray-300"} rounded-md p-2 focus:outline-none focus:ring-[#302082] focus:border-[#302082]`}
              placeholder="Entrez votre mot de passe actuel"
            />
            {passwordError && (
              <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                {passwordError}
              </div>
            )}
          </div>
        </div>

        <PaymentMethodsForm
          initialData={{
            card_name: paymentMethod.card_name,
            is_default: paymentMethod.is_default,
          }}
          onSubmit={handleUpdate}
          loading={loading}
        />
      </div>
    </StripeWrapper>
  )
}
