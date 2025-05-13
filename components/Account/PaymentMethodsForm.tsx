"use client"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

export function PaymentMethodsForm({ initialData = null, onSubmit, loading }) {
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
        // console.error("Erreur Stripe:", error)
        setErrorMessage(
          error.message ||
            "Une erreur est survenue lors de la validation de la carte."
        )
        return
      }

      console.log("PaymentMethod créé:", paymentMethod)

      onSubmit({
        stripe_payment_id: paymentMethod.id,
        card_name: cardName,
        last_card_digits: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year,
        is_default: isDefault,
      })

      setCardName("")
      setIsDefault(false)
      cardElement.clear()
    } catch (err) {
      console.error("Erreur inattendue:", err)
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {errorMessage && (
        <div className="text-red-600 text-sm mb-2">{errorMessage}</div>
      )}
      <div className="bg-gray-100 p-4 rounded-lg space-y-3">
        <div>
          <label
            htmlFor="card_name"
            className="block text-sm font-medium text-gray-700"
          >
            Nom sur la carte
          </label>
          <input
            id="card_name"
            value={cardName}
            onChange={e => setCardName(e.target.value)}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="card_element"
            className="block text-sm font-medium text-gray-700"
          >
            Détails de la carte
          </label>
          <div className="mt-1 border border-gray-300 rounded-md p-2 bg-white">
            <CardElement id="card_element" options={cardElementOptions} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_default"
          checked={isDefault}
          onChange={e => setIsDefault(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="is_default" className="text-sm text-gray-700">
          Définir comme carte par défaut
        </label>
      </div>
      <Button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  )
}
