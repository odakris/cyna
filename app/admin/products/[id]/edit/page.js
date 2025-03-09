// /app/admin/products/[id]/edit/page.js
"use client";

import AdminLayout from "@/components/AdminLayout/AdminLayout";
import ClientSessionProvider from "@/components/ClientSessionProvider/ClientSessionProvider";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

function EditProductContent() {
  const { data: session } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [formData, setFormData] = useState(null);

  // Récupérer le produit depuis l’API
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Erreur lors de la récupération des produits");
        const products = await response.json();
        const product = products.find((p) => p.id_produit === parseInt(id));
        if (product) {
          setFormData({
            id_produit: product.id_produit,
            nom: product.nom,
            prix_unitaire: product.prix_unitaire.toString(),
            description: product.description || "",
            caracteristiques_techniques: product.caracteristiques_techniques || "",
            disponible: product.disponible.toString(),
            ordre_priorite: product.ordre_priorite.toString(),
            id_categorie: product.id_categorie.toString(),
            image: product.image || "default_image.jpg",
          });
        }
      } catch (error) {
        console.error("Erreur fetchProduct:", error);
      }
    }
    fetchProduct();
  }, [id]);

  // Mettre à jour le produit via l’API
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Produit modifié:", formData);
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_produit: parseInt(formData.id_produit),
          nom: formData.nom,
          prix_unitaire: parseFloat(formData.prix_unitaire),
          description: formData.description,
          caracteristiques_techniques: formData.caracteristiques_techniques,
          disponible: formData.disponible === "true",
          ordre_priorite: parseInt(formData.ordre_priorite),
          id_categorie: parseInt(formData.id_categorie),
          image: formData.image,
        }),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      const updatedProduct = await response.json();
      console.log("Produit mis à jour:", updatedProduct);
      router.push("/admin/products?refresh=true");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  console.log("EditProductContent - Rendu avec session:", session, "FormData:", formData);

  if (!formData) return <p>Produit non trouvé</p>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Modifier le produit</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle : {session?.user?.role}
      </p>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4">
        <div>
          <label className="block">Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
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
            value={formData.prix_unitaire}
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
            rows="4"
          />
        </div>
        {/* Ajout de champs supplémentaires si nécessaire */}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Enregistrer
        </button>
        <Link href="/admin/products" className="ml-4 text-blue-500">
          Annuler
        </Link>
      </form>
    </AdminLayout>
  );
}

export default function EditProduct() {
  console.log("EditProduct - Rendu principal");
  return (
    <ClientSessionProvider>
      <EditProductContent />
    </ClientSessionProvider>
  );
}