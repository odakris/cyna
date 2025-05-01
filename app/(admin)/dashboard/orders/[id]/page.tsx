import { Metadata } from "next"
import OrderDetailPage from "@/components/Admin/Orders/Detail/OrderDetailPage"
import { validateId } from "@/lib/utils/utils"

export const metadata: Metadata = {
  title: "Détails de la commande | CYNA Backoffice",
  description: "Détails de la commande",
}

export default async function OrderPage({
  params,
}: {
  params: { id: string }
}) {
  const resolvedParams = await params
  const id = validateId(resolvedParams.id)
  if (id === null) {
    throw new Error("Invalid order ID")
  }
  return <OrderDetailPage orderId={id.toString()} />
}
