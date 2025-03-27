"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductWithImages } from "@/types/Types"
import { TopProducts } from "../../../components/TopProduits/TopProduits"
import { useCart } from "@/context/CartContext"

const ProductPage = () => {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [product, setProduct] = useState<ProductWithImages>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  // const [selectedSubscription, setSelectedSubscription] =
  //   useState<string>("mensuel") // Par défaut, sélection mensuelle

  // Référence pour faire défiler vers le tableau tarifaire
  const pricingTableRef = useRef<HTMLTableElement | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchProductById = async () => {
      try {
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok)
          throw new Error("Erreur lors de la récupération du produit")
        const data: ProductWithImages = await response.json()
        setProduct(data)
      } catch (error) {
        setError("Erreur lors de la récupération du produit")
        console.error("Erreur lors de la récupération du produit :", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductById()
  }, [id])

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error ?? "Produit non trouvé."}
      </p>
    )
  }

  // Fonction pour gérer l'ajout au panier avec l'abonnement sélectionné
  const handleAddToCart = (subscriptionType: string) => {
    if (!product || !product.available) return // Ne pas ajouter au panier si le produit est indisponible

    addToCart({
      id: product.id_product,
      name: product.name,
      price:
        subscriptionType === "mensuel"
          ? 49.99
          : subscriptionType === "annuel"
            ? 499.9
            : product.unit_price,
      quantity: 1,
      subscription: subscriptionType,
    })
  }

  // Fonction pour faire défiler vers le tableau tarifaire
  const handleScrollToPricingTable = () => {
    pricingTableRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const prixMensuel = "49.99"
  const prixAnnuel = "499.90"

  const prixUnitaire = product?.unit_price
  const prixParAppareil = 19.99 // Exemple de prix par appareil

  return (
    <>
      <section className="bg-white py-8 px-6 text-center">
        {loading ? (
          <Skeleton className="w-1/2 h-10 mx-auto mb-4" />
        ) : (
          <h1 className="text-4xl font-extrabold text-gray-900">
            {product?.name}
          </h1>
        )}

        <CarouselPlugin images={product?.product_caroussel_images} />

        {loading ? (
          <Skeleton className="w-3/4 h-6 mx-auto mt-6" />
        ) : (
          <p className="w-full text-lg text-gray-700 mt-6 mx-auto">
            {product?.description}
          </p>
        )}
      </section>

      {/* Section Caractéristiques Techniques et Disponibilité */}
      <section className="flex flex-col sm:flex-row gap-8 py-8 px-6 bg-gray-50">
        <div className="w-full sm:w-1/2 p-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Caractéristiques techniques
          </h2>
          {loading ? (
            <Skeleton className="w-3/4 h-6 mx-auto" />
          ) : (
            <p className="text-sm text-gray-600 text-center">
              {product?.technical_specs}
            </p>
          )}
        </div>

        <div className="w-full sm:w-1/2 p-4 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            {loading ? (
              <Skeleton className="w-1/2 h-6 mx-auto" />
            ) : product?.available ? (
              "Disponible immédiatement"
            ) : (
              "Service Indisponible"
            )}
          </h2>

          {loading ? (
            <Skeleton className="w-full h-[60%] rounded-lg" />
          ) : (
            <div className="flex justify-center w-full">
              {product?.available ? (
                <Button
                  className="w-auto py-2 text-lg" // Réduit la taille du bouton ici
                  variant="cyna"
                  onClick={handleScrollToPricingTable} // Ajout du scroll ici
                >
                  S&apos;ABONNER MAINTENANT
                </Button>
              ) : (
                <Button className="w-auto py-2 text-lg" variant="cyna" disabled>
                  SERVICE INDISPONIBLE
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section des informations tarifaires - Tableau simplifié */}
      {product?.available && (
        <section className="py-8 px-6 bg-white" ref={pricingTableRef}>
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Choisir une formule d&apos;abonnement
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full max-w-screen-lg mx-auto table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-center w-1/3">
                    Modèle Tarifaire
                  </th>
                  <th className="px-4 py-2 text-center w-1/3">Prix</th>
                  <th className="px-4 py-2 text-center w-1/3">
                    Ajouter au Panier
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-4 py-2 text-center">
                    Coût unitaire
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} €
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("unitaire")}
                      className="w-auto py-1 text-sm"
                      variant="cyna"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-center">
                    Abonnement Mensuel
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} € puis
                    <br /> {prixMensuel}€ / mois
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("mensuel")}
                      className="w-auto py-1 text-sm"
                      variant="cyna"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="border px-4 py-2 text-center">
                    Abonnement Annuel
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} € puis <br /> {prixAnnuel}€ / an (dont 2 mois
                    offerts)
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("annuel")}
                      className="w-auto py-1 text-sm"
                      variant="cyna"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
                {/* Prix par appareil */}
                <tr>
                  <td className="border px-4 py-2 text-center">
                    Coût par Appareil
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {prixUnitaire} € puis <br /> {prixParAppareil}€ / appareil
                    supplémentaire
                  </td>
                  <td className="border px-4 py-2 text-center">
                    <Button
                      onClick={() => handleAddToCart("appareil")}
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
        </section>
      )}

      {/* Similar Products Section */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Services SaaS similaires
        </h2>

        <div className="w-full my-8">
          <TopProducts />
        </div>
      </section>
    </>
  )
}

export default ProductPage
