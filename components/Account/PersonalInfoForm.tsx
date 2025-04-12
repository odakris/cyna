"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Prisma } from "@prisma/client"
import { userFormSchema } from "@/lib/validations/user-schema"
import { z } from "zod"

export default function PersonalInfoForm({ user }: { user: Prisma.User }) {
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    password: user.password || "",
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
      // Validation avec Zod
      const validatedData = userFormSchema.parse({
        ...formData,
        role: "CUSTOMER", // requis par le schéma
      })

      const res = await fetch(`/api/users/${user.id_user}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.message || "Erreur lors de la mise à jour.")
      }

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
        alert((err as Error).message || "Une erreur est survenue")
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
          <label className="block font-medium">Prénom</label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm">{errors.last_name}</p>
          )}
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
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password}</p>
          )}
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
