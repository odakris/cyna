"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { AddressForm } from "@/components/Account/AdresseForm"

export default function EditAddressPage() {
  const router = useRouter()
  const { id_address } = useParams() // Récupérer l'ID depuis l'URL
  const { data: session } = useSession()

  const [address, setAddress] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAddress = async () => {
      if (id_address && session?.user?.id) {
        const response = await fetch(
          `/api/users/${session.user.id}/addresses/${id_address}`
        )
        const data = await response.json()
        if (response.ok) {
          setAddress(data)
        }
      }
    }

    fetchAddress()
  }, [id_address, session?.user?.id])

  const handleUpdate = async (updatedAddress: any) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/users/${session?.user?.id}/addresses/${id_address}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedAddress),
        }
      )

      if (!response.ok) {
        throw new Error("Échec de la mise à jour")
      }

      router.push("/account/settings")
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (!address) return <div>Chargement...</div>

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
