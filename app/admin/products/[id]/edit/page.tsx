"use client"

import AdminLayout from "@/components/AdminLayout/AdminLayout"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductType } from "../../../../../types/Types"

export default function EditProductContent() {
  const { data: session } = useSession()
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [formData, setFormData] = useState<ProductType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      if (!id || isNaN(parseInt(id))) {
        console.error("ID invalide:", id)
        setLoading(false)
        return
      }

      try {
        // console.log("Récupération du produit avec id:", id)
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok) {
          const errorData = await response.json()
          console.error("Erreur API:", errorData.message)
          throw new Error("Erreur lors de la récupération du produit")
        }
        const product = await response.json()
        if (product) {
          setFormData({
            id_product: parseInt(id),
            name: product.name,
            unit_price: product.unit_price,
            description: product.description || "",
            technical_specs: product.technical_specs || "",
            available: product.available,
            priority_order: product.priority_order,
            last_updated: product.last_updated,
            id_category: product.id_category,
            image: product.image || "default_image.jpg",
            stock: product.stock,
          })
        } else {
          console.log("Aucun produit trouvé pour id:", id)
        }
      } catch (error) {
        console.error("Erreur fetchProduct:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData) {
      console.error("Erreur: formData est null, impossible de soumettre.")
      return
    }
    // console.log("Envoi des données pour mise à jour:", formData)
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_product: parseInt(id),
          name: formData.name,
          unit_price: Number(formData.unit_price),
          description: formData.description,
          technical_specs: formData.technical_specs,
          available: formData.available,
          priority_order: formData.priority_order,
          id_category: formData.id_category,
          image: formData.image,
          stock: formData.stock,
          last_updated: new Date().toISOString(),
        }),
      })

      // console.log("Statut de la réponse PUT:", response.status)
      if (!response.ok) {
        const errorData = await response.text() // Utiliser text() pour voir la réponse brute
        console.error("Erreur API brute:", errorData)
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`)
      }

      const updatedProduct = await response.json()
      console.log("Produit mis à jour:", updatedProduct)
      router.push("/admin/products?refresh=true")
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!formData) return
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (!session) return <p>Veuillez vous connecter pour accéder à cette page</p>
  if (loading) return <p>Chargement...</p>
  if (!formData) return <p>Produit non trouvé</p>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Modifier le produit</h1>
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
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded"
          disabled={!formData}
        >
          Enregistrer
        </button>
        <Link href="/admin/products" className="ml-4 text-blue-500">
          Annuler
        </Link>
      </form>
    </AdminLayout>
  )
}
