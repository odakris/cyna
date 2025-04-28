"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { AddressForm } from "@/components/Account/AdresseForm"
import { AddressFormValues } from "@/lib/validations/address-schema"

export default function EditAddressPage() {
  const router = useRouter()
  const { id_address } = useParams() // Récupérer l'ID depuis l'URL
  const { data: session } = useSession()

  const [address, setAddress] = useState<AddressFormValues | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAddress = async () => {
      if (id_address && session?.user?.id_user) {
        try {
          const response = await fetch(
            `/api/users/${session.user.id_user}/addresses/${id_address}`,
            {
              credentials: "include",
            }
          )
          if (!response.ok) {
            throw new Error("Échec de la récupération de l'adresse")
          }
          const data = await response.json()
          setAddress(data)
        } catch (err: any) {
          setError(err.message || "Une erreur est survenue")
        }
      }
    }

    fetchAddress()
  }, [id_address, session?.user?.id_user])

  const handleUpdate = async (updatedAddress: AddressFormValues) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/users/${session?.user?.id_user}/addresses/${id_address}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updatedAddress),
        }
      )

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erreur inconnue" }))
        throw new Error(errorData.message || "Échec de la mise à jour")
      }

      router.push("/account/settings")
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la mise à jour")
    } finally {
      setLoading(false)
    }
  }

  if (error) return <div className="text-red-500 p-6">{error}</div>
  if (!address) return <div className="p-6">Chargement...</div>

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Modifier l&apos;adresse</h1>
      <AddressForm
        initialData={address}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  )
}
