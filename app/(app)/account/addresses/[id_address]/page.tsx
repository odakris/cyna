"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { AddressForm } from "../../../../../components/Account/AdresseForm"

export default function EditAddressPage() {
  const { id_address } = useParams()
  const { data: session } = useSession()
  const router = useRouter()

  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAddress = async () => {
      if (id_address && session?.user?.id_user) {
        try {
          console.log("[EditAddressPage] Récupération de l'adresse:", { id_address, userId: session.user.id_user })
          const response = await fetch(
            `/api/users/${session.user.id_user}/addresses/${id_address}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          const data = await response.json()
          console.log("[EditAddressPage] Réponse API:", { status: response.status, data })
          if (response.ok) {
            setAddress(data)
          } else {
            setErrorMessage(data.message || "Erreur lors de la récupération de l’adresse.")
          }
        } catch (err) {
          console.error("[EditAddressPage] Erreur lors de la récupération:", err)
          setErrorMessage("Une erreur est survenue lors de la récupération de l’adresse.")
        }
      }
    }

    if (session) {
      fetchAddress()
    }
  }, [id_address, session])

  const checkPassword = async (password: string) => {
    try {
      const response = await fetch("/api/check-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()
      return data.isValid
    } catch (err) {
      console.error("[EditAddressPage] Erreur vérification mot de passe:", err)
      return false
    }
  }

  const handleUpdate = async (newAddress: any) => {
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

    if (!session?.user?.id_user) {
      setErrorMessage("Vous devez être connecté.")
      setLoading(false)
      return
    }

    try {
      console.log("[EditAddressPage] Mise à jour de l'adresse:", { id_address, userId: session.user.id_user })
      const response = await fetch(
        `/api/users/${session.user.id_user}/addresses/${id_address}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAddress),
        }
      )

      console.log("[EditAddressPage] Réponse API PUT:", { status: response.status })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de la mise à jour.")
      }

      console.log("[EditAddressPage] Adresse mise à jour, redirection vers /account/settings")
      router.push("/account/settings")
    } catch (err: any) {
      console.error("[EditAddressPage] Erreur mise à jour:", err)
      setErrorMessage(err.message || "Erreur mise à jour adresse.")
    }

    setLoading(false)
  }

  if (!session) {
    return <div>Chargement...</div>
  }

  if (!address) {
    return <div>{errorMessage || "Chargement..."}</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Modifier l’adresse</h1>
      {errorMessage && <div className="text-red-600 text-sm mb-4">{errorMessage}</div>}
      <p className="text-sm text-gray-600">
        Pour modifier votre adresse, veuillez remplir le formulaire ci-dessous.
      </p>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Mot de passe actuel
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
        {passwordError && (
          <div className="text-red-600 text-sm mt-2">{passwordError}</div>
        )}
      </div>

      <AddressForm
        initialData={address}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  )
}