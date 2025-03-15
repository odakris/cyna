"use client";

import AdminLayout from "@/components/AdminLayout/AdminLayout";
import ClientSessionProvider from "@/components/ClientSessionProvider/ClientSessionProvider";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

// Définir l'interface pour les données du produit
interface Product {
  id_produit: number;
  nom: string;
  prix_unitaire: number;
  description: string | null;
  disponible: boolean;
  ordre_priorite: number;
  id_categorie: number;
  image: string | null;
}

// Définir les props pour le composant ProductDetailsContent (facultatif ici, car aucune prop n'est passée)
interface ProductDetailsContentProps {}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = () => {
  const { data: session } = useSession();
  const { id } = useParams() as { id: string };
  const [product, setProduct] = useState<Product | null>(null);

  // Récupérer le produit depuis l’API
  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Erreur lors de la récupération des produits");
        const products: Product[] = await response.json();
        const foundProduct = products.find((p) => p.id_produit === parseInt(id));
        console.log("Produit trouvé:", foundProduct);
        setProduct(foundProduct || null);
      } catch (error) {
        console.error("Erreur fetchProduct:", error);
      }
    }
    fetchProduct();
  }, [id]);

  console.log("ProductDetailsContent - Rendu avec session:", session, "Product:", product);

  if (!product) return <p>Produit non trouvé</p>;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Détails du produit</h1>
      <p className="mb-4">
        Bienvenue dans le back-office, {session?.user?.name} ! Rôle : {session?.user?.role}
      </p>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">{product.nom}</h2>
        <p>Prix : {product.prix_unitaire.toFixed(2)} €</p>
        <p>Description : {product.description || "Aucune description"}</p>
        <p>Disponible : {product.disponible ? "Oui" : "Non"}</p>
        <p>Ordre de priorité : {product.ordre_priorite}</p>
        <p>Catégorie ID : {product.id_categorie}</p>
        <p>Image : {product.image}</p>
        <Link href="/admin/products" className="mt-4 inline-block text-blue-500">
          Retour à la liste
        </Link>
      </div>
    </AdminLayout>
  );
};

// Définir les props pour le composant ProductDetails (facultatif ici, car aucune prop n'est passée)
interface ProductDetailsProps {}

const ProductDetails: React.FC<ProductDetailsProps> = () => {
  console.log("ProductDetails - Rendu principal");
  return (
    <ClientSessionProvider>
      <ProductDetailsContent />
    </ClientSessionProvider>
  );
};

export default ProductDetails;