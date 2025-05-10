"use client"

import { useEffect } from "react"
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
  selectedAddress: Address | null
  paymentInfos: PaymentInfo[]
  selectedPayment: PaymentInfo | null
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
  finalTotal,
  onBack,
  handleProceedToPayment,
  processingPayment,
  error = null,
}: CheckoutReviewProps) {
  useEffect(() => {
    console.log("[CheckoutReview] Props reçues:", {
      selectedAddress,
      selectedPayment,
      cartLength: cart.length,
      finalTotal,
      processingPayment,
      error,
      handleProceedToPaymentType: typeof handleProceedToPayment,
    })
  }, [selectedAddress, selectedPayment, cart, finalTotal, processingPayment, error, handleProceedToPayment])

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

            {selectedAddress ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-1">
                  <p className="font-medium">
                    {selectedAddress.first_name} {selectedAddress.last_name}
                  </p>
                  <p>{selectedAddress.address1}</p>
                  {selectedAddress.address2 && (
                    <p>{selectedAddress.address2}</p>
                  )}
                  <p>
                    {selectedAddress.postal_code} {selectedAddress.city}
                    {selectedAddress.region && `, ${selectedAddress.region}`}
                  </p>
                  <p>{selectedAddress.country}</p>
                  <p className="flex items-center gap-2 pt-1">
                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                    {selectedAddress.mobile_phone}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-red-600">Aucune adresse sélectionnée</p>
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

            {selectedPayment ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="space-y-1">
                  <p className="font-medium">{selectedPayment.card_name}</p>
                  <p className="flex items-center gap-2">
                    <LockKeyhole className="h-3.5 w-3.5 text-gray-500" />
                    {selectedPayment.brand || "Carte"} ****{" "}
                    {selectedPayment.last_card_digits}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-red-600">Aucun moyen de paiement sélectionné</p>
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
              Articles ({cart.reduce((count, item) => count + item.quantity, 0)})
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

      <CardFooter className="bg-gray-50 border-t p-4 flex flex-col gap-3">
        <Button
          className="w-full sm:w-auto px-3 text-sm"
          variant="outline"
          onClick={onBack}
          disabled={processingPayment}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>

        <Button
          className="w-full sm:w-auto px-3 text-sm bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
          onClick={handleProceedToPayment}
          disabled={processingPayment || !selectedAddress || !selectedPayment}
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