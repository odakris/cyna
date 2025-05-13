"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AddressForm } from "@/components/Account/AdresseForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function AddAddressPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/addresses/add")
    }
  }, [status, router])

  const handleCreate = async (newAddress: any) => {
    setLoading(true)
    setErrorMessage(null)

    if (!session?.user?.id_user) {
      setErrorMessage("Vous devez être connecté pour ajouter une adresse.")
      setLoading(false)
      return
    }

    // Vérifie si newAddress est valide
    if (!newAddress || Object.keys(newAddress).length === 0) {
      setErrorMessage("Les données de l'adresse sont invalides ou manquantes.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch(
        `/api/users/${session.user.id_user}/addresses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAddress),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Erreur lors de la création de l'adresse."
        )
      }

      router.push("/account/settings")
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          "Une erreur est survenue lors de la création de l'adresse."
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
              <Link href="/auth?redirect=/account/addresses/add">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] relative pb-2 inline-block">
            Ajouter une adresse
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Ajoutez une nouvelle adresse à votre carnet d&apos;adresses. Vous
          pourrez ensuite l&apos;utiliser pour vos livraisons et facturations.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm flex gap-2 items-start">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <AddressForm onSubmit={handleCreate} loading={loading} />
    </div>
  )
}
