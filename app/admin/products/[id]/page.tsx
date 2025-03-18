"use client"

import AdminLayout from "@/components/AdminLayout/AdminLayout"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductType } from "../../../../types/Types"

export default function ProductDetailsContent() {
  const { data: session } = useSession()
  const { id } = useParams() as { id: string }
  const [product, setProduct] = useState<ProductType | null>(null)

  // Récupérer le produit depuis l’API
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch("/api/products")
        if (!response.ok)
          throw new Error("Erreur lors de la récupération des produits")
        const products: ProductType[] = await response.json()
        const foundProduct = products.find(p => p.id_product === parseInt(id))
        // console.log("Produit trouvé:", foundProduct)
        setProduct(foundProduct || null)
      } catch (error) {
        console.error("Erreur fetchProduct:", error)
      }
    }
    fetchProduct()
  }, [id])

  // console.log(
  //   "ProductDetailsContent - Rendu avec session:",
  //   session,
  //   "Product:",
  //   product
  // )

  if (!product) return <p>Produit non trouvé</p>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Détails du produit</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle :{" "}
        {session?.user?.role}
      </p>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">{product.name}</h2>
        <p>Prix : {product.unit_price.toFixed(2)} €</p>
        <p>Description : {product.description || "Aucune description"}</p>
        <p>Disponible : {product.available ? "Oui" : "Non"}</p>
        <p>Ordre de priorité : {product.priority_order}</p>
        <p>
          Dernière mise à jour :{" "}
          {new Date(product.last_updated).toLocaleDateString()}
        </p>
        <p>Stock : {product.stock}</p>
        <p>Catégorie ID : {product.id_category}</p>
        <p>Image : {product.image}</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-blue-500"
        >
          Retour à la liste
        </Link>
      </div>
    </AdminLayout>
  )
}
