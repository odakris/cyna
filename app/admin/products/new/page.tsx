"use client"

import AdminLayout from "@/components/AdminLayout/AdminLayout"
import ClientSessionProvider from "@/components/ClientSessionProvider/ClientSessionProvider"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ProductType } from "../../../types"

// Définir l'interface pour les données du formulaire
interface FormData {
  name: string
  unit_price: number
  description: string
}

// Définir l'interface pour les données envoyées à l'API
// interface ProductData {
//   nom: string
//   prix_unitaire: number
//   description: string
//   caracteristiques_techniques: string
//   disponible: boolean
//   ordre_priorite: number
//   date_maj: string
//   id_category: number
//   image: string
// }

const NewProductContent = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    unit_price: 0,
    description: "",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const productData: ProductType = {
      name: formData.name,
      unit_price: formData.unit_price,
      description: formData.description || "",
      technical_specs: "Caractéristiques techniques à définir",
      available: true,
      priority_order: 1,
      last_updated: new Date().toISOString(),
      id_category: 1, // À ajuster selon vos catégories
      image: "default_image.jpg",
      stock: 0,
    }
    // console.log("Données envoyées:", productData)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })
      const result = await response.json()
      // console.log("Réponse API:", result)
      if (response.ok) {
        router.push("/admin/products?refresh=true")
      } else {
        console.error("Erreur API:", result)
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Ajouter un produit</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle :{" "}
        {session?.user?.role}
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow space-y-4"
      >
        <div>
          <label className="block">Nom</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block">Prix (€)</label>
          <input
            type="number"
            name="unit_price"
            value={formData.unit_price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        <div>
          <label className="block">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Ajouter
        </button>
        <Link href="/admin/products" className="ml-4 text-blue-500">
          Annuler
        </Link>
      </form>
    </AdminLayout>
  )
}

const NewProduct = () => {
  return (
    <ClientSessionProvider>
      <NewProductContent />
    </ClientSessionProvider>
  )
}

export default NewProduct
