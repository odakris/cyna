"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { PaymentMethodsForm } from "@/components/Account/PaymentMethodsForm" // Assure-toi d'importer le formulaire ici

export default function EditPaymentMethodPage() {
  const { id_payment } = useParams() // Récupérer l'ID depuis l'URL
  const { data: session } = useSession()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPaymentMethod = async () => {
      if (id_payment && session?.user?.id) {
        const response = await fetch(
          `/api/users/${session.user.id}/payments/${id_payment}`
        )
        const data = await response.json()
        if (response.ok) {
          setPaymentMethod(data)
        }
      }
    }

    fetchPaymentMethod()
  }, [id_payment, session?.user?.id])

  const handleUpdate = async (updatedPaymentMethod: any) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/users/${session?.user?.id}/payments/${id_payment}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedPaymentMethod),
        }
      )

      if (!response.ok) {
        throw new Error("Échec de la mise à jour")
      }

      router.push("/account/settings") // Redirige vers la page des paramètres
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (!paymentMethod) return <div>Chargement...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Modifier la méthode de paiement</h1>
      <PaymentMethodsForm
        initialData={paymentMethod}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  )
}
