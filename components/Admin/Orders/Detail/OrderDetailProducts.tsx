import Image from "next/image"
import { OrderWithItems } from "@/types/Types"
import { SubscriptionType } from "@prisma/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { JSX } from "react"

interface OrderDetailProductsProps {
  order: OrderWithItems
  totalQuantity: number
  subscriptionStatusConfig: Record<
    string,
    { bgColor: string; color: string; icon?: JSX.Element; label?: string }
  >
  formatPrice: (price: number) => string
}

export default function OrderDetailProducts({
  order,
  totalQuantity,
  subscriptionStatusConfig,
  formatPrice,
}: OrderDetailProductsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Détails de la commande</CardTitle>
        <CardDescription>
          {totalQuantity} article{totalQuantity > 1 ? "s" : ""} • Facture #
          {order.invoice_number}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produit</TableHead>
              <TableHead className="text-center">Quantité</TableHead>
              <TableHead className="text-center">Prix unitaire</TableHead>
              <TableHead className="text-center">Abonnement</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.order_items.map(item => (
              <TableRow key={item.id_order_item}>
                <TableCell className="font-medium">
                  <div className="flex items-start gap-2">
                    {item.product.main_image && (
                      <div className="h-10 w-10 rounded border overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.main_image}
                          alt={item.product.name}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ID: {item.product.id_product}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-center">
                  {formatPrice(item.unit_price)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center">
                    <Badge variant="outline">
                      {item.subscription_type === SubscriptionType.MONTHLY
                        ? "Mensuel"
                        : item.subscription_type === SubscriptionType.YEARLY
                          ? "Annuel"
                          : item.subscription_type}
                    </Badge>
                    <div className="mt-1">
                      <Badge
                        className={`text-xs ${subscriptionStatusConfig[item.subscription_status]?.bgColor} ${subscriptionStatusConfig[item.subscription_status]?.color}`}
                      >
                        {
                          subscriptionStatusConfig[item.subscription_status]
                            ?.icon
                        }
                        <span className="ml-1">
                          {subscriptionStatusConfig[item.subscription_status]
                            ?.label || item.subscription_status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(item.unit_price * item.quantity)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                Sous-total
              </TableCell>
              <TableCell className="text-right">
                {formatPrice(order.subtotal)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} className="text-right">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {formatPrice(order.total_amount)}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
