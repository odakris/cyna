"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { AddressForm } from "../../../../../components/Account/AdresseForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function EditAddressPage() {
  const { id_address } = useParams()
  const { data: session, status } = useSession()
  const router = useRouter()

  const [address, setAddress] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [password, setPassword] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth?redirect=/account/addresses")
    }
  }, [status, router])

  useEffect(() => {
    const fetchAddress = async () => {
      if (id_address && session?.user?.id_user) {
        try {
          const response = await fetch(
            `/api/users/${session.user.id_user}/addresses/${id_address}`,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
          const data = await response.json()
          if (response.ok) {
            setAddress(data)
          } else {
            setErrorMessage(
              data.message || "Erreur lors de la récupération de l'adresse."
            )
          }
        } catch {
          setErrorMessage(
            "Une erreur est survenue lors de la récupération de l'adresse."
          )
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
    } catch {
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

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Échec de la mise à jour.")
      }

      router.push("/account/settings")
    } catch {
      setErrorMessage(err.message || "Erreur mise à jour adresse.")
    }

    setLoading(false)
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
              <Link href="/auth?redirect=/account/settings">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!address) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#302082] relative pb-2 inline-block">
            Modifier l&apos;adresse
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h1>
        </div>
        <p className="text-gray-600 max-w-3xl">
          Mettez à jour les informations de votre adresse. Nous vous demanderons
          votre mot de passe pour confirmer les modifications.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-red-600 text-sm">
          {errorMessage}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Mot de passe actuel <span className="text-red-500">*</span>
        </label>
        <div className="relative max-w-md">
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={`mt-1 block w-full border ${passwordError ? "border-red-500" : "border-gray-300"} rounded-md p-2 focus:outline-none focus:ring-[#302082] focus:border-[#302082]`}
            placeholder="Entrez votre mot de passe actuel"
          />
          {passwordError && (
            <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {passwordError}
            </div>
          )}
        </div>
      </div>

      <AddressForm
        initialData={address}
        onSubmit={handleUpdate}
        loading={loading}
      />
    </div>
  )
}
