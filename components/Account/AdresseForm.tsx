"use client"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { updateAddress, deleteAddress } from "@/lib/services/addressService"

export default function AddressForm({ user }) {
  const [addresses, setAddresses] = useState(user.addresses || [])

  const handleAddAddress = async newAddress => {
    try {
      const updatedAddresses = await updateAddress(newAddress)
      setAddresses(updatedAddresses)
      toast.success("Adresse ajoutée avec succès.")
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'ajout de l'adresse.")
    }
  }

  const handleDeleteAddress = async addressId => {
    try {
      const updatedAddresses = await deleteAddress(addressId)
      setAddresses(updatedAddresses)
      toast.success("Adresse supprimée avec succès.")
    } catch (error) {
      toast.error(
        error.message || "Erreur lors de la suppression de l'adresse."
      )
    }
  }

  return (
    <div>
      <h2>Mes adresses</h2>
      <button
        onClick={() =>
          handleAddAddress({
            /* Nouvelle adresse */
          })
        }
      >
        Ajouter une adresse
      </button>
      <ul>
        {addresses.map(address => (
          <li key={address.id}>
            {address.address1} -{" "}
            <button onClick={() => handleDeleteAddress(address.id)}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
