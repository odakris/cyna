"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useOrder } from "@/hooks/order/use-order"
import { LoadingState } from "@/components/Checkout/LoadingState"
import { OrderHeader } from "@/components/Success/OrderHeader"
import { OrderDetails } from "@/components/Success/OrderDetails"
import { NextStepsCard } from "@/components/Success/NextStepsCard"
import { ErrorState } from "@/components/Success/ErrorState"

interface Address {
  id_address: string
  first_name: string
  last_name: string
  address1: string
  address2?: string | null
  postal_code: string
  city: string
  country: string
  mobile_phone: string
}

interface PaymentInfo {
  id_payment_info: string | number
  card_name: string
  last_card_digits: string
  brand?: string
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const { data: session, status: sessionStatus } = useSession()
  console.log("[SuccessPage] Session data:", { session, sessionStatus })

  const isGuest = session?.user?.isGuest || false
  const userId = session?.user?.id_user

  const {
    order,
    loading,
    error,
    downloadingInvoice,
    handleDownloadInvoice,
    guestEmail,
  } = useOrder(orderId)

  const [decryptedAddress, setDecryptedAddress] = useState<Address | null>(null)
  const [decryptedLastCardDigits, setDecryptedLastCardDigits] = useState<string | null>(null)
  const [decryptError, setDecryptError] = useState<string | null>(null)

  // Déchiffrement des données
  useEffect(() => {
    if (!order || !order.id_address || sessionStatus === "loading") return

    const decryptData = async () => {
      console.log("[SuccessPage] Début du déchiffrement pour orderId:", orderId, { userId, isGuest })
      try {
        let addresses: Address[] = []
        let payments: PaymentInfo[] = []

        // Vérifier si les données sont chiffrées
        const isAddressEncrypted = order.address.first_name.includes(":")
        const isPaymentEncrypted = order.last_card_digits?.includes(":")

        if (!isAddressEncrypted && !isPaymentEncrypted) {
          console.log("[SuccessPage] Données déjà déchiffrées")
          setDecryptedAddress(order.address)
          setDecryptedLastCardDigits(order.last_card_digits)
          return
        }

        // Préparer les données à déchiffrer
        if (isAddressEncrypted) {
          addresses = [order.address]
        }
        if (isPaymentEncrypted && order.last_card_digits) {
          payments = [
            {
              id_payment_info: order.id_order.toString(),
              card_name: "",
              last_card_digits: order.last_card_digits,
            },
          ]
        }

        console.log("[SuccessPage] Données à déchiffrer:", { addresses, payments })

        if (addresses.length === 0 && payments.length === 0) {
          console.log("[SuccessPage] Aucune donnée à déchiffrer")
          setDecryptedAddress(order.address)
          setDecryptedLastCardDigits(order.last_card_digits)
          return
        }

        // Appeler l'API de déchiffrement
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
        const decryptRoute = '/api/crypt/user/decrypt'
        console.log("[SuccessPage] Envoi de la requête à:", decryptRoute, { userId, isGuest })
        const response = await fetch(`${baseUrl}${decryptRoute}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(userId ? { "x-user-id": userId.toString() } : {}),
          },
          credentials: "include",
          body: JSON.stringify({ addresses, payments }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("[SuccessPage] Échec du déchiffrement:", {
            status: response.status,
            errorText,
          })
          throw new Error(`Échec du déchiffrement: ${response.status} - ${errorText}`)
        }

        const { addresses: decryptedAddresses, payments: decryptedPayments } = await response.json()
        console.log("[SuccessPage] Données déchiffrées:", {
          decryptedAddresses,
          decryptedPayments,
        })

        // Trouver l'adresse correspondant à id_address
        const addressData = decryptedAddresses.find(
          (addr: Address) => addr.id_address === order.id_address
        )
        // Trouver le paiement correspondant (si disponible)
        const paymentData = decryptedPayments.length > 0 ? decryptedPayments[0] : null

        console.log("[SuccessPage] Données sélectionnées:", { addressData, paymentData })

        if (!addressData) {
          throw new Error("Adresse introuvable dans les données déchiffrées")
        }

        setDecryptedAddress(addressData)
        setDecryptedLastCardDigits(paymentData?.last_card_digits || order.last_card_digits)
      } catch (err) {
        console.error("[SuccessPage] Erreur lors du déchiffrement:", {
          message: err instanceof Error ? err.message : "Erreur inconnue",
          stack: err instanceof Error ? err.stack : undefined,
        })
        setDecryptError(err instanceof Error ? err.message : "Erreur lors du déchiffrement des données")
      }
    }

    decryptData()
  }, [order, orderId, isGuest, userId, sessionStatus])

  // Log pour confirmer le chargement de la page
  useEffect(() => {
    console.log("[SuccessPage] Page chargée:", {
      orderId,
      loading,
      error: error || null,
      decryptError,
      orderExists: !!order,
      guestEmail,
      decryptedAddress,
      decryptedLastCardDigits,
      searchParams: Object.fromEntries(searchParams.entries()),
      sessionStatus,
    })
  }, [orderId, loading, error, order, guestEmail, decryptedAddress, decryptedLastCardDigits, decryptError, searchParams, sessionStatus])

  // Récupère l'email soit du guest, soit de l'utilisateur connecté
  const email = guestEmail || order?.user?.email || ""

  if (sessionStatus === "loading" || loading) {
    return <LoadingState message="Chargement des détails de votre commande..." />
  }

  if (error || !order) {
    return <ErrorState error={error || "Impossible de charger la commande"} />
  }

  if (decryptError) {
    return <ErrorState error={decryptError} />
  }

  if (!decryptedAddress) {
    return <LoadingState message="Déchiffrement des données en cours..." />
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <OrderHeader orderId={order.id_order} email={email} />

      <OrderDetails
        order={{
          ...order,
          address: decryptedAddress,
          last_card_digits: decryptedLastCardDigits,
        }}
        downloadingInvoice={downloadingInvoice}
        handleDownloadInvoice={handleDownloadInvoice}
        guestEmail={guestEmail || undefined}
      />

      <NextStepsCard email={email} />
    </div>
  )
}