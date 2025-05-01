import { OrderWithItems } from "@/types/Types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface OrderShippingInfoProps {
  order: OrderWithItems
}

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Adresse de livraison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {order.address ? (
          <div className="space-y-1">
            <p className="font-medium">
              {order.user.first_name} {order.user.last_name}
            </p>
            <p>{order.address.address1}</p>
            <p>
              {order.address.postal_code} {order.address.city}
            </p>
            <p>{order.address.country}</p>
          </div>
        ) : (
          <div className="text-muted-foreground">Adresse non disponible</div>
        )}
      </CardContent>
    </Card>
  )
}
