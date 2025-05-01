import { OrderWithItems } from "@/types/Types"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Receipt, ExternalLink } from "lucide-react"
import { JSX } from "react"

interface OrderPaymentInfoProps {
  order: OrderWithItems
  formattedDate: string
  orderStatusConfig: Record<
    string,
    { bgColor: string; color: string; icon: JSX.Element; label: string }
  >
}

export default function OrderPaymentInfo({
  order,
  formattedDate,
  orderStatusConfig,
}: OrderPaymentInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de paiement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="font-medium">Méthode de paiement</div>
            <div className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {order.payment_method}
                {order.last_card_digits &&
                  ` (**** **** **** ${order.last_card_digits})`}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <div className="font-medium">Date du paiement</div>
            <div>{formattedDate}</div>
          </div>
          <div className="flex items-center justify-between border-b pb-2">
            <div className="font-medium">Statut du paiement</div>
            <Badge
              className={`${orderStatusConfig[order.order_status]?.bgColor} ${orderStatusConfig[order.order_status]?.color}`}
            >
              {orderStatusConfig[order.order_status]?.icon}
              <span className="ml-1">
                {orderStatusConfig[order.order_status]?.label ||
                  order.order_status}
              </span>
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-medium">Numéro de facture</div>
            <div className="flex items-center">
              <Receipt className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{order.invoice_number}</span>
            </div>
          </div>
        </div>
      </CardContent>
      {order.invoice_pdf_url && (
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <a
              href={order.invoice_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir la facture
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
