"use client"
import { useState } from "react"
import { toast } from "react-hot-toast"
import {
  updateSubscription,
  cancelSubscription,
} from "@/lib/services/subscriptionService"

export default function SubscriptionForm({ user }) {
  const [subscription, setSubscription] = useState(user.subscription)

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(subscription.id)
      setSubscription(null)
      toast.success("Abonnement annulé avec succès.")
    } catch (error) {
      toast.error(
        error.message || "Erreur lors de l'annulation de l'abonnement."
      )
    }
  }

  return (
    <div>
      <h2>Mes abonnements</h2>
      {subscription ? (
        <div>
          <p>Abonnement : {subscription.plan}</p>
          <button onClick={handleCancelSubscription}>
            Annuler l'abonnement
          </button>
        </div>
      ) : (
        <p>Vous n'avez aucun abonnement actif.</p>
      )}
    </div>
  )
}
