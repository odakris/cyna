"use client"

import { useEffect, useState } from "react"
import { Elements } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"

// Vérifier la clé publique Stripe
// console.log("Clé publique Stripe:", process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  : Promise.reject("La clé publique Stripe est manquante")

export default function StripeWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [isStripeReady, setIsStripeReady] = useState(false)

  useEffect(() => {
    stripePromise.then(stripe => {
      if (stripe) {
        setIsStripeReady(true)
      } else {
        // console.error("Erreur lors de l'initialisation de Stripe.")
      }
    })
  }, [])

  if (!isStripeReady) {
    return <div>Chargement de Stripe...</div> // Optionnel, affichage pendant le chargement
  }

  return <Elements stripe={stripePromise}>{children}</Elements>
}
