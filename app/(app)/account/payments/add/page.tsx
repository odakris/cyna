"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { PaymentMethodsForm } from "@/components/Account/PaymentMethodsForm"
import StripeWrapper from "@/components/StripeWrapper"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle, CreditCard } from "lucide-react"

export default function AddPaymentMethod() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/payments/add")
    }
  }, [status, router])

  const handleCreate = async (newPaymentMethod: any) => {
    setLoading(true)
    setErrorMessage(null)

    if (!session?.user?.id_user) {
      setErrorMessage(
        "Vous devez être connecté pour ajouter une méthode de paiement."
      )
      setLoading(false)
      return
    }

    if (!newPaymentMethod || Object.keys(newPaymentMethod).length === 0) {
      setErrorMessage(
        "Les données de la méthode de paiement sont invalides ou manquantes."
      )
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `/api/users/${session.user.id_user}/payments`,
        {
          method: "POST",
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
            "Erreur lors de la création de la méthode de paiement."
        )
      }

      router.push("/account/settings")
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Une erreur est survenue lors de l'ajout de la méthode de paiement."
      )
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user) {
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
              <Link href="/auth?redirect=/account/payments/add">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <StripeWrapper>
      <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] relative pb-2 inline-block">
              Ajouter un moyen de paiement
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
            </h1>
          </div>
          <p className="text-gray-600 max-w-3xl">
            Ajoutez une nouvelle carte bancaire à votre compte. Toutes vos
            données de paiement sont sécurisées et cryptées.
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm flex gap-2 items-start">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <PaymentMethodsForm onSubmit={handleCreate} loading={loading} />

        <div className="mt-8 p-4 bg-[#302082]/5 border border-[#302082]/20 rounded-lg">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-[#302082] mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#302082]">
                Information importante sur la sécurité
              </p>
              <p className="text-sm text-gray-600 mt-1">
                CYNA utilise Stripe, un prestataire de paiement certifié PCI DSS
                de niveau 1, pour traiter vos paiements en toute sécurité. Vos
                données de carte bancaire sont cryptées et sécurisées selon les
                plus hauts standards de l&apos;industrie.
              </p>
            </div>
          </div>
        </div>
      </div>
    </StripeWrapper>
  )
}
