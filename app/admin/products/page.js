// /app/admin/products/page.js
"use client";

import AdminLayout from "@/components/AdminLayout/AdminLayout";
import ClientSessionProvider from "@/components/ClientSessionProvider/ClientSessionProvider";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";

function ProductsContent() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [refresh, setRefresh] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Erreur lors de la récupération des produits");
      const data = await response.json();
      console.log("Produits reçus dans page:", data);
      setProducts(data);
    } catch (error) {
      console.error("Erreur fetchProducts:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refresh]);

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    const idsToDelete = selected;
    for (const id of idsToDelete) {
      await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    }
    setSelected([]);
    setRefresh(!refresh);
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle : {session?.user?.role}
      </p>
      <div className="mb-6">
        <Link href="/admin/products/new" className="bg-blue-500 text-white p-2 rounded">
          Ajouter un produit
        </Link>
        <button
          onClick={handleDelete}
          disabled={selected.length === 0}
          className={`ml-4 p-2 rounded ${
            selected.length > 0 ? "bg-red-500 text-white" : "bg-gray-300 text-gray-500"
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
            <th className="border p-2">Nom</th>
            <th className="border p-2">Prix (€)</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id_produit} className="hover:bg-gray-100">
              <td className="border p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(product.id_produit)}
                  onChange={() => handleSelect(product.id_produit)}
                />
              </td>
              <td className="border p-2">{product.nom}</td>
              <td className="border p-2">{product.prix_unitaire.toFixed(2)}</td>
              <td className="border p-2">
                <Link href={`/admin/products/${product.id_produit}`} className="text-blue-500 mr-2">
                  Détails
                </Link>
                <Link href={`/admin/products/${product.id_produit}/edit`} className="text-green-500">
                  Modifier
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
}

export default function Products() {
  return (
    <ClientSessionProvider>
      <ProductsContent />
    </ClientSessionProvider>
  );
}