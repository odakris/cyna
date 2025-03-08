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
  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState("nom"); // Colonne par défaut
  const [sortDirection, setSortDirection] = useState("asc"); // Direction par défaut

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      console.log("Produits reçus dans page:", data);
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error("Erreur fetchProducts:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refresh]);

  // Gestion du tri
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
  });

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (confirm(`Voulez-vous supprimer ${selected.length} produit(s) ?`)) {
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
    }
  };

  // Fonction pour déterminer l'icône de tri à afficher
  const getSortIcon = (column) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? "↑" : "↓"; // Flèche pour la colonne active
    }
    return "↕"; // Flèche neutre par défaut pour indiquer que la colonne est triable
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle : {session?.user?.role}
      </p>
      {error && <p className="text-red-500 mb-4">Erreur: {error}</p>}
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
            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("nom")}
            >
              Nom {getSortIcon("nom")}
            </th>
            <th
              className="border p-2 cursor-pointer"
              onClick={() => handleSort("prix_unitaire")}
            >
              Prix (€) {getSortIcon("prix_unitaire")}
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
          {sortedProducts.map((product) => (
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