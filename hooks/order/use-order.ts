import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

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
      console.error("Erreur parsing JSON:", err)
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

      try {
        // Tenter de récupérer l'email de l'invité depuis localStorage
        const storedGuestEmail =
          typeof window !== "undefined"
            ? localStorage.getItem("guestEmail")
            : null
        if (storedGuestEmail) {
          setGuestEmail(storedGuestEmail)
        }

        const response = await fetch(`/api/orders/${orderId}`)

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
        console.error("Erreur réseau lors du chargement de la commande:", error)
        setError("Erreur réseau lors du chargement de la commande")
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

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
      const response = await fetch(`/api/invoices/${order.id_order}/download`)

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement de la facture")
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

      toast({
        title: "Téléchargement réussi",
        description: "Votre facture a été téléchargée",
        variant: "success",
      })
    } catch (error) {
      console.error("Erreur téléchargement facture:", error)
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
