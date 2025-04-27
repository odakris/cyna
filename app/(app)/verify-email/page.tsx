"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "react-hot-toast"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      if (!token) {
        setMessage("Token invalide")
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Échec de la vérification")
        }

        toast.success("E-mail vérifié avec succès")
        router.push("/account/settings")
      } catch (err: any) {
        setMessage(err.message || "Une erreur est survenue")
        toast.error(err.message || "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [searchParams, router])

  if (loading)
    return <div className="py-10 text-center">Vérification en cours...</div>
  if (message)
    return <div className="py-10 text-center text-red-500">{message}</div>

  return <div className="py-10 text-center">Vérification en cours...</div>
}
