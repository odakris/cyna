import { OrderWithItems } from "@/types/Types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface OrderSummaryProps {
  order: OrderWithItems
  totalQuantity: number
  formatPrice: (price: number) => string
}

export default function OrderSummary({
  order,
  totalQuantity,
  formatPrice,
}: OrderSummaryProps) {
  return (
    <Card>
      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">
          Résumé de la commande
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Date de commande:
            </span>
            <span className="text-xs sm:text-sm">
              {format(new Date(order.order_date), "dd/MM/yyyy", {
                locale: fr,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Nombre d&apos;articles:
            </span>
            <span className="text-xs sm:text-sm">{totalQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Méthode de paiement:
            </span>
            <span className="text-xs sm:text-sm">{order.payment_method}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span className="text-sm">Total:</span>
            <span className="text-sm sm:text-base">
              {formatPrice(order.total_amount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
