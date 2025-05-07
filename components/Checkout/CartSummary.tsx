import { Separator } from "@/components/ui/separator"
import { Globe, Shield, ShoppingCart } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

interface CartItem {
  uniqueId: string
  id: string | number
  name: string
  price: number
  quantity: number
  subscription?: string
  imageUrl?: string
}

interface CartSummaryProps {
  cart: CartItem[]
  totalCartPrice: number
  taxes: number
  finalTotal: number
}

export function CartSummary({
  cart,
  totalCartPrice,
  taxes,
  finalTotal,
}: CartSummaryProps) {
  const totalItems = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <Card className="border-2 border-gray-100 shadow-md sticky top-24">
      <CardHeader className="bg-[#302082]/5 border-b pb-4">
        <CardTitle className="text-lg font-semibold text-[#302082] flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Récapitulatif
        </CardTitle>
        <CardDescription>
          {cart.length} article{cart.length > 1 ? "s" : ""} • {totalItems} unité
          {totalItems > 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-0">
        {/* List of products */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 mb-4">
          {cart.map(item => {
            const unitPrice = (() => {
              switch (item.subscription || "MONTHLY") {
                case "YEARLY":
                  return item.price * 12
                default:
                  return item.price
              }
            })()

            return (
              <div
                key={item.uniqueId}
                className="flex justify-between items-start py-2 border-b border-gray-100"
              >
                <div className="flex-grow">
                  <p className="text-sm font-medium line-clamp-1">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Qté: {item.quantity} × {unitPrice.toFixed(2)}€
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.subscription || "MONTHLY"}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  {(unitPrice * item.quantity).toFixed(2)}€
                </p>
              </div>
            )
          })}
        </div>

        {/* Price summary */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span>{totalCartPrice.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA (20%)</span>
            <span>{taxes.toFixed(2)}€</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-semibold text-base pt-1">
            <span>Total</span>
            <span className="text-[#302082]">{finalTotal.toFixed(2)}€</span>
          </div>
        </div>

        {/* Security information */}
        <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-xs text-blue-800 mb-4">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>
              Paiement sécurisé • Données chiffrées • Livraison de licences
              numériques immédiate
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 px-4 py-3 flex items-center justify-center text-xs text-gray-500 border-t">
        <Globe className="h-3.5 w-3.5 mr-1.5" />
        Support technique disponible 24/7
      </CardFooter>
    </Card>
  )
}
