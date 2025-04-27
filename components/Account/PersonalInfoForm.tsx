"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { userFormSchema } from "@/lib/validations/user-schema"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

type User = {
  id_user: number
  first_name: string
  last_name: string
  email: string
}

export default function PersonalInfoForm({ user }: { user: User }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    currentPassword: "", // nouveau champ
    newPassword: "", // nouveau champ
  })

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const { first_name, last_name, email, currentPassword, newPassword } =
        formData

      // Valider les données
      const validatedData = userFormSchema
        .partial()
        .parse({ first_name, last_name, email })

      if (newPassword) {
        userFormSchema.shape.password.parse(newPassword)
      }

      const res = await fetch(`/api/users/${user.id_user}/email-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...validatedData,
          currentPassword,
          newPassword,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result.message || "Erreur lors de la mise à jour.")
      }

      // Afficher un message de succès
      const message =
        formData.email !== user.email
          ? "Un e-mail de confirmation a été envoyé à votre nouvelle adresse."
          : "Informations mises à jour avec succès."
      toast.success(message)
      router.push("/account/settings")
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof typeof formData, string>> = {}
        err.errors.forEach(error => {
          const field = error.path[0] as keyof typeof formData
          fieldErrors[field] = error.message
        })
        setErrors(fieldErrors)
      } else {
        toast.error((err as Error).message || "Une erreur est survenue")
        console.error("Erreur:", err)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Informations personnelles</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="first_name" className="block font-medium">
            Prénom
          </label>
          <Input
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="mt-1"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="last_name" className="block font-medium">
            Nom
          </label>
          <Input
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="mt-1"
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="currentPassword" className="block font-medium">
            Mot de passe actuel
          </label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            className="mt-1"
          />
          {errors.currentPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.currentPassword}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block font-medium">
            Nouveau mot de passe
          </label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            className="mt-1"
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </div>
  )
}
