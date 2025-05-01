import { OrderWithItems } from "@/types/Types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface OrderHistoryProps {
  order: OrderWithItems
  formattedDate: string
}

export default function OrderHistory({
  order,
  formattedDate,
}: OrderHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique de la commande</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className={`h-2 w-2 mt-2 rounded-full bg-green-500`} />
              <div>
                <div className="font-semibold">Commande créée</div>
                <div className="text-sm text-muted-foreground">
                  {formattedDate}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className={`h-2 w-2 mt-2 rounded-full ${order.order_status === "PENDING" ? "bg-gray-300" : "bg-green-500"}`}
              />
              <div>
                <div
                  className={`font-semibold ${order.order_status === "PENDING" ? "text-muted-foreground" : ""}`}
                >
                  Paiement reçu
                </div>
                {order.order_status !== "PENDING" && (
                  <div className="text-sm text-muted-foreground">
                    {formattedDate}
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
