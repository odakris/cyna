"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PaymentMethodsForm } from "@/components/Account/PaymentMethodsForm"
import StripeWrapper from "@/components/StripeWrapper"
import { useState } from "react"

export default function AddPaymentMethod() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleCreate = async (newPaymentMethod: any) => {
    setLoading(true)
    setErrorMessage(null)

    if (!session?.user?.id_user) {
      console.error("Session utilisateur non trouvée.")
      setErrorMessage(
        "Vous devez être connecté pour ajouter une méthode de paiement."
      )
      setLoading(false)
      return
    }

    if (!newPaymentMethod || Object.keys(newPaymentMethod).length === 0) {
      console.error(
        "Les données de la méthode de paiement sont invalides ou manquantes."
      )
      setErrorMessage(
        "Les données de la méthode de paiement sont invalides ou manquantes."
      )
      setLoading(false)
      return
    }

    console.log("User ID:", session.user.id_user)
    console.log("Données envoyées :", newPaymentMethod)

    try {
      const response = await fetch(`/api/users/${session.user.id_user}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPaymentMethod),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erreur API:", errorData)
        throw new Error(
          errorData.message ||
            "Erreur lors de la création de la méthode de paiement."
        )
      }

      router.push("/account/settings")
    } catch (err: any) {
      console.error("Erreur dans handleCreate:", err)
      setErrorMessage(
        err.message ||
          "Une erreur est survenue lors de l'ajout de la méthode de paiement."
      )
    }

    setLoading(false)
  }

  return (
    <StripeWrapper>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">
          Ajouter une méthode de paiement
        </h1>
        {errorMessage && (
          <div className="text-red-600 text-sm mb-4">{errorMessage}</div>
        )}
        <PaymentMethodsForm onSubmit={handleCreate} loading={loading} />
      </div>
    </StripeWrapper>
  )
}
