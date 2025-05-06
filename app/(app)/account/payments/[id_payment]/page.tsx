"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PaymentMethodsForm } from "@/components/Account/PaymentMethodsForm"
import StripeWrapper from "@/components/StripeWrapper"

export default function EditPaymentMethodPage() {
  const { id_payment } = useParams()
  const { data: session } = useSession()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      if (id_payment && session?.user?.id_user) {
        try {
          console.log("[EditPaymentMethodPage] Récupération du moyen de paiement:", { id_payment, userId: session.user.id_user });
          const response = await fetch(
            `/api/users/${session.user.id_user}/payments/${id_payment}`
          )
          const data = await response.json()
          console.log("[EditPaymentMethodPage] Réponse API:", { status: response.status, data });
          if (response.ok) {
            setPaymentMethod(data)
          } else {
            setErrorMessage(
              data.message ||
                "Erreur lors de la récupération de la méthode de paiement."
            )
          }
        } catch (err) {
          console.error("[EditPaymentMethodPage] Erreur lors de la récupération:", err)
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
    } catch (err) {
      console.error("[EditPaymentMethodPage] Erreur lors de la vérification du mot de passe:", err)
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
      console.log("[EditPaymentMethodPage] Mise à jour du moyen de paiement:", { id_payment, userId: session.user.id_user });
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

      console.log("[EditPaymentMethodPage] Réponse API PUT:", { status: response.status });
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message ||
            "Échec de la mise à jour de la méthode de paiement."
        )
      }

      console.log("[EditPaymentMethodPage] Moyen de paiement mis à jour, redirection vers /account/settings");
      router.push("/account/settings")
    } catch (err: any) {
      console.error("[EditPaymentMethodPage] Erreur dans handleUpdate:", err)
      setErrorMessage(
        err.message ||
          "Une erreur est survenue lors de la mise à jour de la méthode de paiement."
      )
    }

    setLoading(false)
  }

  if (!session) {
    return <div>Chargement...</div>
  }

  if (!paymentMethod) {
    return <div>{errorMessage || "Chargement..."}</div>
  }

  return (
    <StripeWrapper>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Modifier la méthode de paiement</h1>
        {errorMessage && (
          <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
        )}
        <p className="text-sm text-gray-600">
          Pour modifier votre carte bancaire, veuillez entrer les nouvelles
          informations de carte ci-dessous.
        </p>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Mot de passe actuel
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {passwordError && (
            <div className="text-red-600 text-sm mt-2">{passwordError}</div>
          )}
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