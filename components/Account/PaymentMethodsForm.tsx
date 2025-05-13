"use client"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AlertCircle, CreditCard, Save } from "lucide-react"

interface PaymentMethodsFormProps {
  initialData?: {
    card_name?: string
    is_default?: boolean
  } | null
  onSubmit: (data: any) => void
  loading?: boolean
}

export function PaymentMethodsForm({
  initialData = null,
  onSubmit,
  loading = false,
}: PaymentMethodsFormProps) {
  const [cardName, setCardName] = useState(initialData?.card_name || "")
  const [isDefault, setIsDefault] = useState(initialData?.is_default || false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!stripe || !elements) {
      setErrorMessage("Stripe n'est pas initialisé.")
      return
    }

    if (!cardName.trim()) {
      setErrorMessage("Le nom sur la carte est requis.")
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setErrorMessage("Élément de carte introuvable.")
      return
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: cardName,
        },
      })

      if (error) {
        setErrorMessage(
          error.message ||
            "Une erreur est survenue lors de la validation de la carte."
        )
        return
      }

      onSubmit({
        stripe_payment_id: paymentMethod.id,
        card_name: cardName,
        last_card_digits: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year,
        is_default: isDefault,
      })
    } catch {
      setErrorMessage("Une erreur inattendue est survenue.")
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#1a202c",
        fontFamily: "Inter, sans-serif",
        "::placeholder": {
          color: "#a0aec0",
        },
      },
      invalid: {
        color: "#e53e3e",
      },
    },
    hidePostalCode: true,
  }

  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b">
        <CardTitle className="text-xl font-semibold text-[#302082] flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          {initialData ? "Modifier la carte" : "Ajouter une carte"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} id="payment-form" className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2 mb-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="card_name" className="text-sm font-medium">
              Nom sur la carte <span className="text-red-500">*</span>
            </Label>
            <Input
              id="card_name"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              required
              placeholder="Nom inscrit sur la carte"
              className="focus-visible:ring-[#302082]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="card_element" className="text-sm font-medium">
              Informations de la carte <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 border border-gray-300 rounded-md p-3 bg-white focus-within:ring-1 focus-within:ring-[#302082] focus-within:border-[#302082]">
              <CardElement id="card_element" options={cardElementOptions} />
            </div>
            <p className="text-xs text-gray-500 mt-1.5">
              Vos données de paiement sont sécurisées et cryptées.
            </p>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={isDefault}
              onCheckedChange={val => setIsDefault(!!val)}
            />
            <Label htmlFor="is_default" className="text-sm font-normal">
              Définir comme carte par défaut
            </Label>
          </div>
        </form>
      </CardContent>
      <CardFooter className="border-t bg-gray-50/50 flex justify-end">
        <Button
          form="payment-form"
          type="submit"
          disabled={loading || !stripe || !elements}
          className="bg-[#302082] hover:bg-[#302082]/90 text-white"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
