import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"

export interface OrderItem {
  id_product: number
  quantity: number
  unit_price: number
  subscription_type: string
  name?: string
}

export interface Address {
  first_name: string
  last_name: string
  address1: string
  address2: string | null
  city: string
  postal_code: string
  country: string
}

export interface Order {
  id_order: number
  invoice_number: string
  total_amount: number
  order_status: string
  payment_method: string
  last_card_digits: string | null
  address: Address
  user: {
    email: string
  }
  order_items: OrderItem[]
  created_at?: string
}

export function useOrder(orderId: string | null) {
  const { toast } = useToast()
  const { data: session, status: sessionStatus } = useSession()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [guestEmail, setGuestEmail] = useState<string | null>(null)

  // Safely parse JSON response
  const safeParseJson = async (response: Response) => {
    try {
      const text = await response.text()
      return text ? JSON.parse(text) : {}
    } catch (err) {
      console.error("[use-order] Erreur parsing JSON:", err)
      return { message: "Réponse serveur invalide" }
    }
  }

  // Fetch order data
  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setError("Aucun ID de commande fourni")
        setLoading(false)
        return
      }

      // Attendre que sessionStatus soit résolu
      if (sessionStatus === "loading") {
        return
      }

      try {
        // Tenter de récupérer l'email de l'invité depuis la session
        if (session?.user?.isGuest && session.user.email) {
          setGuestEmail(session.user.email)
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await safeParseJson(response)
          setError(
            `Erreur lors du chargement de la commande: ${errorData.message || "Erreur inconnue"}`
          )
          setLoading(false)
          return
        }

        const data = await safeParseJson(response)
        setOrder(data.order || data)
        setLoading(false)
      } catch (error) {
        console.error("[use-order] Erreur réseau lors du chargement de la commande:", error)
        setError("Erreur réseau lors du chargement de la commande")
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, sessionStatus])

  // Handle invoice download
  const handleDownloadInvoice = async () => {
    if (!order) {
      toast({
        title: "Erreur",
        description:
          "Impossible de télécharger la facture: commande introuvable",
        variant: "destructive",
      })
      return
    }

    setDownloadingInvoice(true)

    try {
      console.log("[use-order] Requête de téléchargement facture:", {
        orderId: order.id_order,
        sessionStatus,
        isGuest: session?.user?.isGuest,
      })

      const response = await fetch(`/api/invoices/${order.id_order}/download`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await safeParseJson(response)
        console.error("[use-order] Échec de la requête:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        })
        throw new Error(
          `Erreur lors du téléchargement de la facture: ${errorData.message || "Erreur inconnue"}`
        )
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `facture_${order.invoice_number || order.id_order}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      console.log("[use-order] Facture téléchargée avec succès:", {
        orderId: order.id_order,
      })

      toast({
        title: "Téléchargement réussi",
        description: "Votre facture a été téléchargée",
        variant: "success",
      })
    } catch (error) {
      console.error("[use-order] Erreur téléchargement facture:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement de la facture",
        variant: "destructive",
      })
    } finally {
      setDownloadingInvoice(false)
    }
  }

  return {
    order,
    loading,
    error,
    downloadingInvoice,
    handleDownloadInvoice,
    guestEmail,
  }
}