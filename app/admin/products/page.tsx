"use client"

import AdminLayout from "@/components/AdminLayout/AdminLayout"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { ProductType } from "../../types"

export default function ProductsContent() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<ProductType[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [refresh, setRefresh] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<keyof ProductType>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      const data: ProductType[] = await response.json()
      setProducts(data)
      setError(null)
    } catch (error: unknown) {
      console.error("Erreur fetchProducts:", error)
      setError((error as Error).message || "Erreur inconnue")
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [refresh])

  const handleSort = (column: keyof ProductType) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedProducts = [...products].sort(
    (a: ProductType, b: ProductType) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      return sortDirection === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    }
  )

  const handleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleDelete = async () => {
    if (confirm(`Voulez-vous supprimer ${selected.length} produit(s) ?`)) {
      const idsToDelete = selected
      for (const id of idsToDelete) {
        const response = await fetch("/api/products", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
        if (!response.ok) {
          console.error(`Erreur lors de la suppression du produit ${id}`)
        }
      }
      setSelected([])
      setRefresh(!refresh)
    }
  }

  const getSortIcon = (column: keyof ProductType): string => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? "↑" : "↓"
    }
    return "↕"
  }

  if (!session) return <p>Veuillez vous connecter pour accéder à cette page</p>

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle :{" "}
        {session?.user?.role}
      </p>
      {error && <p className="text-red-500 mb-4">Erreur: {error}</p>}
      <div className="mb-6">
        <Link
          href="/admin/products/new"
          className="bg-blue-500 text-white p-2 rounded"
        >
          Ajouter un produit
        </Link>
        <button
          onClick={handleDelete}
          disabled={selected.length === 0}
          className={`ml-4 p-2 rounded ${
            selected.length > 0
              ? "bg-red-500 text-white"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Supprimer ({selected.length})
        </button>
        <button
          onClick={() => setRefresh(!refresh)}
          className="ml-4 p-2 bg-gray-500 text-white rounded"
        >
          Rafraîchir
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Sélection</th>
            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Nom {getSortIcon("name")}
            </th>
            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("unit_price")}
            >
              Prix (€) {getSortIcon("unit_price")}
            </th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.length === 0 && !error && (
            <tr>
              <td colSpan={4} className="border p-2 text-center">
                Aucun produit trouvé
              </td>
            </tr>
          )}
          {sortedProducts.map((product: ProductType) => (
            <tr key={product.id_product} className="hover:bg-gray-100">
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(product.id_product!)}
                  onChange={() => handleSelect(product.id_product!)}
                />
              </td>
              <td className="border p-2">{product.name}</td>
              <td className="border p-2">{product.unit_price.toFixed(2)}</td>
              <td className="border p-2">
                <Link
                  href={`/admin/products/${product.id_product}`}
                  className="text-blue-500 mr-2"
                >
                  Détails
                </Link>
                <Link
                  href={`/admin/products/${product.id_product}/edit`}
                  className="text-green-500"
                >
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  )
}
