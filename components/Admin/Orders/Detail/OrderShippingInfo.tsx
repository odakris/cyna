import { OrderWithItems } from "@/types/Types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface OrderShippingInfoProps {
  order: OrderWithItems
}

export default function OrderShippingInfo({ order }: OrderShippingInfoProps) {
  return (
    <Card>
      <CardHeader className="py-3 sm:py-6 px-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
          Adresse de livraison
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        {order.address ? (
          <div className="space-y-1">
            <p className="font-medium text-sm sm:text-base">
              {order.user.first_name} {order.user.last_name}
            </p>
            <p className="text-xs sm:text-sm">{order.address.address1}</p>
            <p className="text-xs sm:text-sm">
              {order.address.postal_code} {order.address.city}
            </p>
            <p className="text-xs sm:text-sm">{order.address.country}</p>
          </div>
        ) : (
          <div className="text-xs sm:text-sm text-muted-foreground">
            Adresse non disponible
          </div>
        )}
      </CardContent>
    </Card>
  )
}
