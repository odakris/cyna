"use client"
import { useState } from "react"
import { toast } from "react-hot-toast"
import {
  addPaymentMethod,
  deletePaymentMethod,
} from "@/lib/services/paymentService"

export default function PaymentMethodsForm({ user }) {
  const [paymentMethods, setPaymentMethods] = useState(
    user.paymentMethods || []
  )

  const handleAddPaymentMethod = async method => {
    try {
      const updatedMethods = await addPaymentMethod(method)
      setPaymentMethods(updatedMethods)
      toast.success("Carte ajoutée avec succès.")
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'ajout de la carte.")
    }
  }

  const handleDeletePaymentMethod = async methodId => {
    try {
      const updatedMethods = await deletePaymentMethod(methodId)
      setPaymentMethods(updatedMethods)
      toast.success("Carte supprimée avec succès.")
    } catch (error) {
      toast.error(error.message || "Erreur lors de la suppression de la carte.")
    }
  }

  return (
    <div>
      <h2>Mes méthodes de paiement</h2>
      <button
        onClick={() =>
          handleAddPaymentMethod({
            /* Nouvelle carte */
          })
        }
      >
        Ajouter une carte
      </button>
      <ul>
        {paymentMethods.map(method => (
          <li key={method.id}>
            {method.cardNumber} -{" "}
            <button onClick={() => handleDeletePaymentMethod(method.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
