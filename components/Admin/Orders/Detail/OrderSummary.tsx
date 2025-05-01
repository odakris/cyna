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
      <CardHeader>
        <CardTitle>Résumé de la commande</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date de commande:</span>
            <span>
              {format(new Date(order.order_date), "dd/MM/yyyy", {
                locale: fr,
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Nombre d&apos;articles:
            </span>
            <span>{totalQuantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Méthode de paiement:</span>
            <span>{order.payment_method}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
