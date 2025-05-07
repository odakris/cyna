"use client"

import { useSearchParams } from "next/navigation"
import { useOrder } from "@/hooks/order/use-order"
import { LoadingState } from "@/components/Checkout/LoadingState"
import { OrderHeader } from "@/components/Success/OrderHeader"
import { OrderDetails } from "@/components/Success/OrderDetails"
import { NextStepsCard } from "@/components/Success/NextStepsCard"
import { ErrorState } from "@/components/Success/ErrorState"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const {
    order,
    loading,
    error,

    downloadingInvoice,
    handleDownloadInvoice,
    guestEmail,
  } = useOrder(orderId)

  // Récupère l'email soit du guest, soit de l'utilisateur connecté
  const email = guestEmail || order?.user?.email || ""

  if (loading) {
    return (
      <LoadingState message="Chargement des détails de votre commande..." />
    )
  }

  if (error || !order) {
    return <ErrorState error={error} />
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      <OrderHeader orderId={order.id_order} email={email} />

      <OrderDetails
        order={order}
        downloadingInvoice={downloadingInvoice}
        handleDownloadInvoice={handleDownloadInvoice}
        guestEmail={guestEmail || undefined}
      />

      <NextStepsCard email={email} />
    </div>
  )
}
