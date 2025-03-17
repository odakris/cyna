"use client"

import AdminLayout from "@/components/AdminLayout/AdminLayout"
import ClientSessionProvider from "@/components/ClientSessionProvider/ClientSessionProvider"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductType } from "../../../../types/ProductType"

// Définir l'interface pour les données du produit
// interface ProductData {
//   id_product: number
//   nom: string
//   prix_unitaire: string
//   description: string
//   caracteristiques_techniques: string
//   disponible: string
//   ordre_priorite: string
//   id_category: string
//   image: string
// }

const EditProductContent = () => {
  const { data: session } = useSession()
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [formData, setFormData] = useState<ProductType | null>(null)

  // Récupérer le produit depuis l’API
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch("/api/products")
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des produits")
        const products = await response.json()
        console.log("Produits récupérés:", products) // Log pour débogage
        const product = products.find((p: any) => p.id_product === parseInt(id))
        if (product) {
          setFormData({
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
      }
    }
    fetchProduct()
  }, [id])

  // Mettre à jour le produit via l’API
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData) {
      console.error("Erreur: formData est null, impossible de soumettre.")
      return
    }
    console.log("Produit modifié:", formData)
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_product: formData.id_product, // Envoi comme number
          name: formData.name,
          unit_price: formData.unit_price,
          description: formData.description,
          technical_specs: formData.technical_specs,
          disponible: formData.available === true,
          ordre_priorite: formData.priority_order,
          id_category: formData.id_category,
          image: formData.image,
          stock: formData.stock,
          last_updated: formData.last_updated.toString(),
        }),
      })
      if (!response.ok) throw new Error("Erreur lors de la mise à jour")
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
    if (!formData) return // Éviter les mises à jour si formData est null
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  console.log(
    "EditProductContent - Rendu avec session:",
    session,
    "FormData:",
    formData
  )

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
            name="nom"
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
            name="prix_unitaire"
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

const EditProduct = () => {
  console.log("EditProduct - Rendu principal")
  return (
    <ClientSessionProvider>
      <EditProductContent />
    </ClientSessionProvider>
  )
}

export default EditProduct
