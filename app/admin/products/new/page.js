// /app/admin/products/new/page.js
"use client";

import AdminLayout from "@/components/AdminLayout/AdminLayout";
import ClientSessionProvider from "@/components/ClientSessionProvider/ClientSessionProvider";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function NewProductContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({ nom: "", prix_unitaire: "", description: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      nom: formData.nom,
      prix_unitaire: parseFloat(formData.prix_unitaire),
      description: formData.description || "",
      caracteristiques_techniques: "Caractéristiques techniques à définir",
      disponible: true,
      ordre_priorite: 1,
      date_maj: new Date().toISOString(),
      id_categorie: 1, // À ajuster selon vos catégories
      image: "default_image.jpg",
    };
    console.log("Données envoyées:", productData);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const result = await response.json();
      console.log("Réponse API:", result);
      if (response.ok) {
        router.push("/admin/products?refresh=true");
      } else {
        console.error("Erreur API:", result);
      }
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Ajouter un produit</h1>
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
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Ajouter
        </button>
        <Link href="/admin/products" className="ml-4 text-blue-500">
          Annuler
        </Link>
      </form>
    </AdminLayout>
  );
}

export default function NewProduct() {
  return (
    <ClientSessionProvider>
      <NewProductContent />
    </ClientSessionProvider>
  );
}