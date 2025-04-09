"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AddressForm } from "@/components/Account/AdresseForm"

export default function AddAddressPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleCreate = async (newAddress: any) => {
    setLoading(true)

    // Vérifie si newAddress est valide
    if (!newAddress || Object.keys(newAddress).length === 0) {
      console.error("Les données de l'adresse sont invalides ou manquantes.")
      setLoading(false)
      return
    }

    // Log de debug pour vérifier que newAddress est bien passé à la fonction
    console.log("Données envoyées :", newAddress);

    try {
      const response = await fetch(
        `/api/users/${session?.user?.id}/addresses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAddress),
        }
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la création de l'adresse (page).")
      }

      router.push("/account/settings")
    } catch (err) {
      console.error(err)
    }

    setLoading(false)
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Ajouter une adresse</h1>
      <AddressForm onSubmit={handleCreate} loading={loading} />
    </div>
  )
}
