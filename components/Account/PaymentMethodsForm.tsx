"use client"

import { useState } from "react"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"

export function PaymentMethodsForm({
  initialData = null, // Rendre initialData optionnel en lui attribuant une valeur par défaut (null)
  onSubmit,
  loading,
}) {
  // Si initialData est fourni, pré-remplir les champs du formulaire avec ces données
  const [cardName, setCardName] = useState(initialData?.card_name || "")
  const [isDefault, setIsDefault] = useState(initialData?.is_default || false)
  const stripe = useStripe()
  const elements = useElements()

  const handleSubmit = async e => {
    e.preventDefault()

    if (!stripe || !elements) return

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) return

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
      billing_details: {
        name: cardName,
      },
    })

    if (error) {
      console.error(error)
      return
    }

    onSubmit({
      stripe_payment_method_id: paymentMethod.id,
      card_name: cardName,
      last_card_digits: paymentMethod.card?.last4,
      brand: paymentMethod.card?.brand,
      is_default: isDefault,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="card_name" className="block text-sm font-medium">
          Nom sur la carte
        </label>
        <input
          id="card_name"
          value={cardName}
          onChange={e => setCardName(e.target.value)}
          required
        />
      </div>

      <div>
        <CardElement options={{ hidePostalCode: true }} />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_default"
          checked={isDefault}
          onChange={e => setIsDefault(e.target.checked)}
        />
        <label htmlFor="is_default">Carte par défaut</label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Enregistrement..." : "Ajouter"}
      </Button>
    </form>
  )
}
