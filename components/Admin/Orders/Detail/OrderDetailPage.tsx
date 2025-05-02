"use client"

import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderDetailSkeleton } from "@/components/Skeletons/OrderSkeletons"
import { useOrderDetail } from "@/hooks/order/use-order-detail"
import {
  CalendarIcon,
  CreditCard,
  Loader2,
  PackageCheck,
  RefreshCcw,
  XCircle,
} from "lucide-react"
import OrderDetailHeader from "@/components/Admin/Orders/Detail/OrderDetailHeader"
import OrderDetailProducts from "@/components/Admin/Orders/Detail/OrderDetailProducts"
import OrderPaymentInfo from "@/components/Admin/Orders/Detail/OrderPaymentInfo"
import OrderHistory from "@/components/Admin/Orders/Detail/OrderHistory"
import OrderCustomerInfo from "@/components/Admin/Orders/Detail/OrderCustomerInfo"
import OrderShippingInfo from "@/components/Admin/Orders/Detail/OrderShippingInfo"
import OrderSummary from "@/components/Admin/Orders/Detail/OrderSummary"
import ErrorDisplay from "@/components/Admin/Orders/Detail/ErrorDisplay"

// Configuration des statuts de commande
const orderStatusConfig = {
  PENDING: {
    label: "En attente",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />,
  },
  PROCESSING: {
    label: "En cours",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <RefreshCcw className="h-4 w-4 text-blue-600" />,
  },
  ACTIVE: {
    label: "Active",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <CreditCard className="h-4 w-4 text-blue-600" />,
  },
  PAID: {
    label: "Payée",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <CreditCard className="h-4 w-4 text-green-600" />,
  },
  COMPLETED: {
    label: "Terminée",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <PackageCheck className="h-4 w-4 text-green-600" />,
  },
  CANCELLED: {
    label: "Annulée",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
  },
  REFUNDED: {
    label: "Remboursée",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    icon: <RefreshCcw className="h-4 w-4 text-purple-600" />,
  },
}

// Configuration des statuts d'abonnement
const subscriptionStatusConfig = {
  PENDING: {
    label: "En attente",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    icon: <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />,
  },
  ACTIVE: {
    label: "Actif",
    color: "text-green-700",
    bgColor: "bg-green-50",
    icon: <PackageCheck className="h-4 w-4 text-green-600" />,
  },
  SUSPENDED: {
    label: "Suspendu",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    icon: <RefreshCcw className="h-4 w-4 text-orange-600" />,
  },
  CANCELLED: {
    label: "Annulé",
    color: "text-red-700",
    bgColor: "bg-red-50",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
  },
  EXPIRED: {
    label: "Expiré",
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    icon: <CalendarIcon className="h-4 w-4 text-gray-600" />,
  },
  RENEWING: {
    label: "Renouvellement",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    icon: <RefreshCcw className="h-4 w-4 text-blue-600" />,
  },
}

interface ProductDetailsPageProps {
  orderId: string
}

export function OrderDetailPage({ orderId }: ProductDetailsPageProps) {
  const {
    order,
    loading,
    error,
    updateStatus,
    setUpdateStatus,
    updating,
    handleUpdateStatus,
    formatDate,
    formatPrice,
    getTotalQuantity,
  } = useOrderDetail(orderId)

  if (loading) {
    return <OrderDetailSkeleton />
  }

  if (error || !order) {
    return <ErrorDisplay errorMessage={error} />
  }

  // Formatter les dates
  const formattedOrderDate = formatDate(order.order_date.toString())
  const totalQuantity = getTotalQuantity()

  return (
    <div className="mx-auto py-6 space-y-6">
      {/* En-tête avec actions */}
      <OrderDetailHeader
        order={order}
        formattedDate={formattedOrderDate}
        updating={updating}
        updateStatus={updateStatus}
        setUpdateStatus={setUpdateStatus}
        handleUpdateStatus={handleUpdateStatus}
        orderStatusConfig={orderStatusConfig}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations produits */}
          <OrderDetailProducts
            order={order}
            totalQuantity={totalQuantity}
            subscriptionStatusConfig={subscriptionStatusConfig}
            formatPrice={formatPrice}
          />

          {/* Informations de paiement et historique */}
          <Tabs defaultValue="payment">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment">Paiement</TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="payment">
              <OrderPaymentInfo
                order={order}
                formattedDate={formattedOrderDate}
                orderStatusConfig={orderStatusConfig}
              />
            </TabsContent>

            <TabsContent value="history">
              <OrderHistory order={order} formattedDate={formattedOrderDate} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Colonne d'informations (sidebar) */}
        <div className="space-y-6">
          {/* Informations client */}
          <OrderCustomerInfo order={order} />

          {/* Adresse de livraison */}
          <OrderShippingInfo order={order} />

          {/* Résumé */}
          <OrderSummary
            order={order}
            totalQuantity={totalQuantity}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
