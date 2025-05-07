import { formatDate } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DownloadCloud,
  Loader2,
  Package,
  Mail,
  Home,
  CreditCard,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

interface OrderItem {
  id_product: number
  quantity: number
  unit_price: number
  subscription_type: string
  name?: string
}

interface Address {
  first_name: string
  last_name: string
  address1: string
  address2?: string | null
  city: string
  postal_code: string
  country: string
  mobile_phone?: string
}

interface Order {
  id_order: number
  invoice_number: string
  total_amount: number
  order_status: string
  payment_method: string
  last_card_digits: string | null
  address: Address
  user: {
    email: string
  }
  order_items: OrderItem[]
  created_at?: string
}

interface OrderDetailsProps {
  order: Order
  downloadingInvoice: boolean
  handleDownloadInvoice: () => Promise<void>
  guestEmail?: string // Ajout d'un email guest optionnel
}

export function OrderDetails({
  order,
  downloadingInvoice,
  handleDownloadInvoice,
  guestEmail,
}: OrderDetailsProps) {
  // Calculate totals
  const subtotal = order.total_amount / 1.2 // Remove 20% VAT
  const tax = order.total_amount - subtotal

  // Utilisez l'email du guest si l'utilisateur est un invité
  const email = guestEmail || order.user?.email || ""

  return (
    <Card className="border-2 border-gray-100 shadow-md mb-6">
      <CardHeader className="bg-[#302082]/5 border-b pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-[#302082]">
              Récapitulatif de commande #{order.id_order}
            </CardTitle>
            <CardDescription>
              {order.created_at && (
                <span>Passée le {formatDate(order.created_at)}</span>
              )}
            </CardDescription>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            {order.order_status || "Confirmée"}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order items */}
        <div>
          <h3 className="text-base font-semibold mb-3 text-[#302082] flex items-center gap-2">
            <Package className="h-4 w-4" />
            Articles ({order.order_items?.length || 0})
          </h3>

          <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {order.order_items &&
                order.order_items.map((item, index) => (
                  <div key={index} className="p-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">
                        {item.name || `Produit ID: ${item.id_product}`}
                      </p>
                      <p className="font-medium">
                        {(item.unit_price * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        Quantité: {item.quantity} × {item.unit_price.toFixed(2)}
                        €
                      </p>
                      <p>
                        Abonnement:{" "}
                        {item.subscription_type.toLowerCase().replace("_", " ")}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Customer information */}
        <div className="space-y-6">
          {/* Billing address */}
          {order.address && (
            <div>
              <h3 className="text-base font-semibold mb-3 text-[#302082] flex items-center gap-2">
                <Home className="h-4 w-4" />
                Adresse de facturation
              </h3>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                <p className="font-medium">
                  {order.address.first_name} {order.address.last_name}
                </p>
                <p>{order.address.address1}</p>
                {order.address.address2 && <p>{order.address.address2}</p>}
                <p>
                  {order.address.postal_code} {order.address.city},{" "}
                  {order.address.country}
                </p>
                {order.address.mobile_phone && (
                  <p>{order.address.mobile_phone}</p>
                )}
              </div>
            </div>
          )}

          {/* Contact information */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#302082] flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Informations de contact
            </h3>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <p className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-gray-500" />
                {email}
              </p>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#302082] flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Moyen de paiement
            </h3>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
              <p>
                {order.payment_method}
                {order.last_card_digits && ` **** ${order.last_card_digits}`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Order summary */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="space-y-2 max-w-xs ml-auto">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total HT</span>
            <span>{subtotal.toFixed(2)}€</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">TVA (20%)</span>
            <span>{tax.toFixed(2)}€</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between font-semibold">
            <span>Total TTC</span>
            <span className="text-lg text-[#302082]">
              {order.total_amount.toFixed(2)}€
            </span>
          </div>

          <div className="pt-4">
            <Button
              className="w-full flex items-center justify-center bg-[#302082] hover:bg-[#302082]/90"
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
            >
              {downloadingInvoice ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DownloadCloud className="mr-2 h-4 w-4" />
              )}
              Télécharger la facture
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
