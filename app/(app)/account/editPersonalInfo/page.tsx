"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function PersonalInfoForm() {
  const { data: session } = useSession()
  const router = useRouter()

  // Initialisation de l'état avec des valeurs vides par défaut
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)

  // Récupérer les informations du client depuis l'API lors de l'initialisation du composant
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/users/${session.user.id}`)
          const data = await response.json()
          if (response.ok) {
            setFormData({
              firstName: data.first_name || "",
              lastName: data.last_name || "",
              email: data.email || "",
              password: "",
            })
          } else {
            console.error("Erreur:", data.error)
          }
        } catch (error) {
          console.error(
            "Erreur de récupération des informations du client:",
            error
          )
        }
      }
    }

    if (session?.user) {
      fetchClientInfo()
    }
  }, [session?.user, session?.user?.email])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!session?.user?.id) {
        throw new Error("Session or user ID is not available.")
      }

      // Construire l'objet de données à envoyer
      const dataToUpdate = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password ? formData.password : undefined,
      }

      // Si le mot de passe est vide, on le supprime de l'objet
      if (!formData.password) {
        delete dataToUpdate.password
      }

      console.log("Données à envoyer avant l'envoi:", dataToUpdate)

      // Envoi de la requête PUT avec les données du formulaire
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToUpdate), // On n'envoie que les données modifiées
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || "Impossible de mettre à jour les informations."
        )
      }

      console.log("Succès: Vos informations ont été mises à jour.")
      router.push("/account/settings") // Redirection après mise à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour des informations:", error)
    }

    setLoading(false)
  }

  // Afficher un message de chargement si les données sont en cours de récupération
  if (!formData.firstName || !formData.lastName || !formData.email) {
    return <div>Chargement des informations...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Modifier mes informations</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Prénom</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">
            Mot de passe (laisser vide pour ne pas changer)
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded mt-4"
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  )
}
