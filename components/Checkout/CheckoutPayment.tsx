"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
} from "lucide-react"
import { CardElement } from "@stripe/react-stripe-js"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export interface PaymentInfo {
  id_payment_info: string | number
  card_name: string
  last_card_digits: string
  stripe_payment_id?: string
  stripe_customer_id?: string
  brand?: string
}

interface CheckoutPaymentProps {
  paymentInfos: PaymentInfo[]
  selectedPayment: PaymentInfo | null
  setSelectedPayment: (payment: PaymentInfo | null) => void
  newPayment: {
    card_name: string
  }
  setNewPayment: (payment: any) => void
  handleSaveNewPayment: () => Promise<void>
  onBack: () => void
  onNext: () => void
  loading?: boolean
  error?: string | null
}

export function CheckoutPayment({
  paymentInfos,
  selectedPayment,
  setSelectedPayment,
  newPayment,
  setNewPayment,
  handleSaveNewPayment,
  onBack,
  onNext,
  loading = false,
  error = null,
}: CheckoutPaymentProps) {
  useEffect(() => {
    console.log("[CheckoutPayment] Props reçues:", {
      paymentInfosCount: paymentInfos.length,
      selectedPayment,
    })
    paymentInfos.forEach((payment) => {
      console.log("[CheckoutPayment] Comparaison radio:", {
        selectedId: selectedPayment?.id_payment_info,
        paymentId: payment.id_payment_info,
        isChecked: selectedPayment?.id_payment_info == payment.id_payment_info,
      })
    })
  }, [paymentInfos, selectedPayment])

  const handlePaymentSelect = (payment: PaymentInfo) => {
    console.log("[CheckoutPayment] Sélection paiement:", payment)
    setSelectedPayment(payment)
  }

  return (
    <Card className="border-2 border-gray-100 shadow-md overflow-hidden">
      <CardHeader className="bg-gray-50 border-b pb-4">
        <CardTitle className="text-lg font-semibold text-[#302082] flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Moyen de paiement
        </CardTitle>
        <CardDescription>
          Sélectionnez un moyen de paiement existant ou ajoutez-en un nouveau
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6 pb-6">
        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded-md border border-red-200 mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {paymentInfos.length === 0 ? (
          <p className="text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200 mb-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            Aucun moyen de paiement enregistré. Veuillez en ajouter un
            ci-dessous.
          </p>
        ) : (
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              Vos moyens de paiement enregistrés :
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentInfos.map(payment => (
                <div
                  key={payment.id_payment_info}
                  className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedPayment?.id_payment_info == payment.id_payment_info
                      ? "border-[#302082] bg-[#302082]/5 shadow-md"
                      : "border-gray-200 hover:border-[#302082]/50 hover:shadow-sm"
                  }`}
                  onClick={() => handlePaymentSelect(payment)}
                >
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{payment.card_name}</div>
                    <div className="flex-shrink-0">
                      <div
                        className={`w-5 h-5 rounded-full border ${
                          selectedPayment?.id_payment_info == payment.id_payment_info
                            ? "border-[#302082] bg-[#302082]"
                            : "border-gray-300"
                        } flex items-center justify-center`}
                      >
                        {selectedPayment?.id_payment_info == payment.id_payment_info && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center">
                      {payment.brand || "Carte"} **** {payment.last_card_digits}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-6" />

        <div>
          <h3 className="text-base font-semibold mb-4 text-[#302082]">
            Ajouter un nouveau moyen de paiement
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nom sur la carte *
              </label>
              <Input
                placeholder="Titulaire de la carte"
                value={newPayment.card_name}
                onChange={e =>
                  setNewPayment({
                    ...newPayment,
                    card_name: e.target.value,
                  })
                }
                className="bg-white focus:ring-[#302082] focus:border-[#302082] text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Détails de la carte *
              </label>
              <div className="p-2 border rounded-md bg-white focus-within:ring-2 focus-within:ring-[#302082] focus-within:border-[#302082] transition-colors min-h-[40px]">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "12px",
                        color: "#424770",
                        "::placeholder": {
                          color: "#aab7c4",
                        },
                      },
                      invalid: {
                        color: "#9e2146",
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-800 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Paiement sécurisé</p>
                <p>
                  Toutes vos données de paiement sont chiffrées et sécurisées.
                  Nous ne stockons pas vos informations de carte complètes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50 border-t p-4 flex flex-col md:flex-row flex-wrap gap-3 justify-between">
        <Button
          className="w-full md:w-auto px-3 text-sm"
          variant="outline"
          onClick={onBack}
          disabled={loading}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <Button
            className="w-full md:w-auto px-3 text-sm bg-[#302082] hover:bg-[#302082]/90"
            onClick={handleSaveNewPayment}
            disabled={loading}
          >
            Ajouter la carte
          </Button>

          {selectedPayment && (
            <Button
              className="w-full md:w-auto px-3 text-sm bg-[#FF6B00] hover:bg-[#FF6B00]/90"
              onClick={onNext}
              disabled={loading}
            >
              Vérifier la commande
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}