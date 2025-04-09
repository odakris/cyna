"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PaymentMethodsForm } from "@/components/Account/PaymentMethodsForm"
import { useState } from "react"

export default function AddPaymentMethod() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCreate = async (newPaymentMethod: any) => {
    setLoading(true)

    // Vérifie si newPaymentMethod est valide
    if (!newPaymentMethod || Object.keys(newPaymentMethod).length === 0) {
      console.error(
        "Les données de la méthode de paiement sont invalides ou manquantes."
      )
      setLoading(false)
      return
    }

    // Log de debug pour vérifier que newPaymentMethod est bien passé à la fonction
    console.log("Données envoyées :", newPaymentMethod)

    try {
      const response = await fetch(`/api/users/${session?.user?.id}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPaymentMethod),
      })

      if (!response.ok) {
        throw new Error(
          "Erreur lors de la création de la méthode de paiement (page)."
        )
      }

      router.push("/account/settings")
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ajouter une méthode de paiement</h1>
      {/* On passe la fonction handleCreate comme prop pour gérer la soumission */}
      <PaymentMethodsForm onSubmit={handleCreate} loading={loading} />
    </div>
  )
}
