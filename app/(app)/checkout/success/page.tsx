"use client"

import { useSearchParams } from "next/navigation"
import { useOrder } from "@/hooks/order/use-order"

// Components
import { OrderHeader } from "@/components/Success/OrderHeader"
import { OrderDetails } from "@/components/Success/OrderDetails"
import { NextStepsCard } from "@/components/Success/NextStepsCard"
import { ErrorState } from "@/components/Success/ErrorState"
import { LoadingState } from "@/components/Checkout/LoadingState"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const { order, loading, error, downloadingInvoice, handleDownloadInvoice } =
    useOrder(orderId)

  // Show loading state
  if (loading) {
    return (
      <LoadingState message="Chargement des détails de votre commande..." />
    )
  }

  // Show error state
  if (error || !order) {
    return <ErrorState error={error} />
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Success header */}
      <OrderHeader orderId={order.id_order} email={order.user.email} />

      {/* Order details */}
      <OrderDetails
        order={order}
        downloadingInvoice={downloadingInvoice}
        handleDownloadInvoice={handleDownloadInvoice}
      />

      {/* Next steps card */}
      <NextStepsCard email={order.user.email} />
    </div>
  )
}
