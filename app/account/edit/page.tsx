"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSession } from "next-auth/react"
import { updateUserInfo } from "@/lib/services/userService"
import { useRouter } from "next/navigation"

export default function PersonalInfoForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  // Initialisation de l'état avec des valeurs vides par défaut
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const [loading, setLoading] = useState(false)

  // Récupérer les informations du client depuis l'API lors de l'initialisation du composant
  useEffect(() => {
    const fetchClientInfo = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user/${session.user.email}`)
          const data = await response.json()
          if (response.ok) {
            setFormData({
              firstName: data.first_name || "", // Mettre à jour les informations dans l'état
              lastName: data.last_name || "",
              email: data.email || "",
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
  }, [session?.user?.email]) // Cette dépendance assure que les infos sont rafraîchies si l'utilisateur change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateUserInfo(formData) // Fonction pour mettre à jour les données
      toast({
        title: "Succès",
        description: "Vos informations ont été mises à jour.",
      })
      router.push("/account/settings") // Rediriger vers la page des paramètres après la mise à jour
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de mettre à jour.",
        variant: "destructive",
      })
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
