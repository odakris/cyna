import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Phone,
  ShoppingCart,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Address } from "./CheckoutAddress"
import { PaymentInfo } from "./CheckoutPayment"

interface CartItem {
  uniqueId: string
  id: string | number
  name: string
  price: number
  quantity: number
  subscription?: string
  imageUrl?: string
}

interface CheckoutReviewProps {
  addresses: Address[]
  selectedAddress: string | null
  paymentInfos: PaymentInfo[]
  selectedPayment: string | null
  cart: CartItem[]
  totalCartPrice: number
  taxes: number
  finalTotal: number
  onBack: () => void
  handleProceedToPayment: () => Promise<void>
  processingPayment: boolean
  error?: string | null
}

export function CheckoutReview({
  addresses,
  selectedAddress,
  paymentInfos,
  selectedPayment,
  cart,
  //   totalCartPrice,
  //   taxes,
  finalTotal,
  onBack,
  handleProceedToPayment,
  processingPayment,
  error = null,
}: CheckoutReviewProps) {
  // Find selected address and payment objects
  const selectedAddressObj = addresses.find(
    a => a.id_address.toString() === selectedAddress
  )
  const selectedPaymentObj = paymentInfos.find(
    p => String(p.id_payment_info) === selectedPayment
  )

  return (
    <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gray-50 border-b pb-4">
        <CardTitle className="text-lg font-semibold text-[#302082] flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          Récapitulatif de la commande
        </CardTitle>
        <CardDescription>
          Vérifiez les détails avant de confirmer votre commande
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}

        <div className="space-y-6">
          {/* Address summary */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#302082] flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse de facturation
            </h3>

            {selectedAddressObj && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-1">
                  <p className="font-medium">
                    {selectedAddressObj.first_name}{" "}
                    {selectedAddressObj.last_name}
                  </p>
                  <p>{selectedAddressObj.address1}</p>
                  {selectedAddressObj.address2 && (
                    <p>{selectedAddressObj.address2}</p>
                  )}
                  <p>
                    {selectedAddressObj.postal_code} {selectedAddressObj.city}
                    {selectedAddressObj.region &&
                      `, ${selectedAddressObj.region}`}
                  </p>
                  <p>{selectedAddressObj.country}</p>
                  <p className="flex items-center gap-2 pt-1">
                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                    {selectedAddressObj.mobile_phone}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-2 text-xs text-right">
              <Button
                variant="link"
                className="h-auto p-0 text-[#302082]"
                onClick={onBack}
              >
                Modifier
              </Button>
            </div>
          </div>

          {/* Payment method summary */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#302082] flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Moyen de paiement
            </h3>

            {selectedPaymentObj && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-1">
                  <p className="font-medium">{selectedPaymentObj.card_name}</p>
                  <p className="flex items-center gap-2">
                    <LockKeyhole className="h-3.5 w-3.5 text-gray-500" />
                    {selectedPaymentObj.brand || "Carte"} ****{" "}
                    {selectedPaymentObj.last_card_digits}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-2 text-xs text-right">
              <Button
                variant="link"
                className="h-auto p-0 text-[#302082]"
                onClick={onBack}
              >
                Modifier
              </Button>
            </div>
          </div>

          {/* Cart items summary */}
          <div>
            <h3 className="text-base font-semibold mb-3 text-[#302082] flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Articles ({cart.reduce((count, item) => count + item.quantity, 0)}
              )
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 divide-y divide-gray-200">
              {cart.map(item => {
                const unitPrice = (() => {
                  switch (item.subscription || "MONTHLY") {
                    case "YEARLY":
                      return item.price * 12
                    default:
                      return item.price
                  }
                })()

                const itemTotal = unitPrice * item.quantity

                return (
                  <div
                    key={item.uniqueId}
                    className="py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="text-sm text-gray-500 mt-1">
                          <p>
                            Quantité: {item.quantity} × {unitPrice.toFixed(2)}€
                            {item.subscription &&
                              ` (${item.subscription.toLowerCase().replace("_", " ")})`}
                          </p>
                        </div>
                      </div>
                      <p className="font-medium">{itemTotal.toFixed(2)}€</p>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-2 text-xs text-right">
              <Button
                variant="link"
                className="h-auto p-0 text-[#302082]"
                asChild
              >
                <Link href="/panier">Modifier</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
        <Button variant="outline" onClick={onBack} disabled={processingPayment}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>

        <Button
          className="w-full sm:w-auto bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          onClick={handleProceedToPayment}
          disabled={processingPayment}
        >
          {processingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>Confirmer et payer {finalTotal.toFixed(2)}€</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
