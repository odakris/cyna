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
import { ScrollArea } from "@/components/ui/scroll-area"

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
      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
        <CardTitle className="text-base sm:text-lg">
          Détails de la commande
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {totalQuantity} article{totalQuantity > 1 ? "s" : ""} • Facture #
          {order.invoice_number}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        {/* Version desktop - tableau standard */}
        <div className="hidden md:block">
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
        </div>

        {/* Version mobile - liste d'articles */}
        <div className="md:hidden px-3">
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-4">
              {order.order_items.map(item => (
                <div key={item.id_order_item} className="border rounded-md p-3">
                  <div className="flex gap-3">
                    {item.product.main_image && (
                      <div className="h-14 w-14 rounded border overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.main_image}
                          alt={item.product.name}
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">
                        {item.product.name}
                      </h4>
                      <div className="text-xs text-muted-foreground mb-1">
                        ID: {item.product.id_product}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          Quantité: {item.quantity}
                        </span>
                        <span className="text-xs font-medium">
                          {formatPrice(item.unit_price)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex gap-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {item.subscription_type === SubscriptionType.MONTHLY
                              ? "Mensuel"
                              : item.subscription_type ===
                                  SubscriptionType.YEARLY
                                ? "Annuel"
                                : item.subscription_type}
                          </Badge>
                          <Badge
                            className={`text-xs ${subscriptionStatusConfig[item.subscription_status]?.bgColor} ${subscriptionStatusConfig[item.subscription_status]?.color}`}
                          >
                            {
                              subscriptionStatusConfig[item.subscription_status]
                                ?.icon
                            }
                            <span className="ml-1">
                              {subscriptionStatusConfig[
                                item.subscription_status
                              ]?.label || item.subscription_status}
                            </span>
                          </Badge>
                        </div>
                        <div className="font-medium text-sm">
                          {formatPrice(item.unit_price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="border-t mt-4 pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sous-total</span>
              <span className="text-sm">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Total</span>
              <span className="text-base font-bold">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
