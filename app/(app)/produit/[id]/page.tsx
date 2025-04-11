"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductWithImages } from "@/types/Types";
import { useCart, CartItem } from "@/context/CartContext"; // Import du type CartItem
import { TopProducts } from "@/components/TopProduits/TopProduits";

const ProductPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductWithImages | null>(null); // null par défaut
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1); // Ajout de la gestion de quantité

  const pricingTableRef = useRef<HTMLTableElement | null>(null);

  // Récupération du produit
  useEffect(() => {
    if (!id) return;

    const fetchProductById = async () => {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok)
          throw new Error("Erreur lors de la récupération du produit");
        const data: ProductWithImages = await response.json();
        setProduct(data);
      } catch (error) {
        setError("Erreur lors de la récupération du produit");
        console.error("Erreur lors de la récupération du produit :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductById();
  }, [id]);

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error ?? "Produit non trouvé."}
      </p>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="w-1/2 h-10 mx-auto mb-4" />
        <Skeleton className="w-full h-[400px] mx-auto mb-6" />
        <Skeleton className="w-3/4 h-6 mx-auto" />
      </div>
    );
  }

  if (!product) {
    return <p className="text-center mt-10">Produit non trouvé.</p>;
  }

  // Prix selon le type d'abonnement
  const prixMensuel = 49.99;
  const prixAnnuel = 499.9;
  const prixUnitaire = product.unit_price;
  const prixParAppareil = 19.99;

  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = (subscriptionType: string) => {
    if (!product || !product.available) return;

    const normalizedSubscription = subscriptionType.toUpperCase();
    const price =
      normalizedSubscription === "MONTHLY"
        ? prixMensuel
        : normalizedSubscription === "YEARLY"
        ? prixAnnuel
        : normalizedSubscription === "PER_MACHINE"
        ? prixParAppareil
        : prixUnitaire;

    const cartItem: CartItem = {
      id: product.id_product.toString(),
      name: product.name,
      price: price,
      quantity: quantity,
      subscription: normalizedSubscription,
      uniqueId: `${product.id_product}-${normalizedSubscription}-${Date.now()}`, // Génération d'un uniqueId
      imageUrl: product.product_caroussel_images?.[0]?.imageUrl || undefined, // Première image si disponible
    };

    addToCart(cartItem);
    console.log("Produit ajouté au panier:", cartItem);
    setQuantity(1); // Réinitialiser la quantité après ajout
  };

  const handleScrollToPricingTable = () => {
    pricingTableRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="bg-white py-8 px-6 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">{product.name}</h1>
        <CarouselPlugin images={product.product_caroussel_images} />
        <p className="w-full text-lg text-gray-700 mt-6 mx-auto">{product.description}</p>
      </section>

      <section className="flex flex-col sm:flex-row gap-8 py-8 px-6 bg-gray-50">
        <div className="w-full sm:w-1/2 p-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Caractéristiques techniques
          </h2>
          <p className="text-sm text-gray-600 text-center">{product.technical_specs}</p>
        </div>
        <div className="w-full sm:w-1/2 p-4 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {product.available ? "Disponible immédiatement" : "Service Indisponible"}
          </h2>
          <div className="flex justify-center w-full">
            {product.available ? (
              <Button
                className="w-auto py-2 text-lg"
                variant="cyna"
                onClick={handleScrollToPricingTable}
              >
                S'ABONNER MAINTENANT
              </Button>
            ) : (
              <Button className="w-auto py-2 text-lg" variant="cyna" disabled>
                SERVICE INDISPONIBLE
              </Button>
            )}
          </div>
        </div>
      </section>

      {product.available && (
        <section className="py-8 px-6 bg-white" ref={pricingTableRef}>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Choisir une formule d'abonnement
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full max-w-screen-lg mx-auto table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-center w-1/3">Modèle Tarifaire</th>
                  <th className="px-4 py-2 text-center w-1/3">Prix</th>
                  <th className="px-4 py-2 text-center w-1/3">Ajouter au Panier</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 text-center">Abonnement Mensuel</td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} € puis <br /> {prixMensuel}€ / mois
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("MONTHLY")}
                      className="w-auto py-1 text-sm"
                      variant="cyna"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-center">Abonnement Annuel</td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} € puis <br /> {prixAnnuel}€ / an (dont 2 mois offerts)
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("YEARLY")}
                      className="w-auto py-1 text-sm"
                      variant="cyna"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-center">Coût par utilisateur</td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} € puis <br /> {prixParAppareil}€ / utilisateur supplémentaire
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("PER_USER")} // Correction du typo
                      className="w-auto py-1 text-sm"
                      variant="cyna"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-center">Coût par Appareil</td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} € puis <br /> {prixParAppareil}€ / appareil supplémentaire
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("PER_MACHINE")} // Correction du typo
                      className="w-auto py-1 text-sm"
                      variant="cyna"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Ajout de la gestion de quantité */}
          <div className="flex justify-center items-center mt-6 space-x-4">
            <label className="text-sm font-medium">Quantité :</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Services SaaS similaires</h2>
        <div className="w-full my-8">
          <TopProducts />
        </div>
      </section>
    </>
  );
};

export default ProductPage;