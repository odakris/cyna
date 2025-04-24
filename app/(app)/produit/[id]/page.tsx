"use client"

import React, { useState, useRef } from "react"
import { useParams } from "next/navigation"
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { useProduct } from "@/hooks/use-product"
import { useCart, CartItem } from "@/context/CartContext"
import { TopProducts } from "@/components/TopProducts/TopProducts"
import { formatEuro } from "@/lib/utils/format"

export default function ProductPage() {
  const { id } = useParams()
  const { product, loading, error } = useProduct(id)
  const { addToCart } = useCart()

  const [quantity, setQuantity] = useState<number>(1)
  const pricingTableRef = useRef<HTMLTableElement | null>(null)

  if (error) {
    return (
      <div className="w-full p-6 text-center">
        <div className="rounded-lg bg-red-50 p-4 text-red-500 border border-red-200">
          <p className="text-sm font-medium">
            {error ?? "Erreur lors du chargement du produit"}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-8">
        <Skeleton className="w-1/2 h-10 mx-auto mb-4" />
        <Skeleton className="w-full h-[400px] mx-auto mb-6" />
        <Skeleton className="w-3/4 h-6 mx-auto" />
        <div className="flex flex-col sm:flex-row gap-8 mt-8">
          <Skeleton className="w-full sm:w-1/2 h-48" />
          <Skeleton className="w-full sm:w-1/2 h-48" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="w-full p-6 text-center">
        <div className="rounded-lg bg-amber-50 p-4 text-amber-700 border border-amber-200">
          <p className="text-sm font-medium">Produit non trouvé</p>
        </div>
      </div>
    )
  }

  // Prix selon le type d'abonnement
  const prixMensuel = 49.99
  const prixAnnuel = 499.9
  const prixUnitaire = product.unit_price
  const prixParAppareil = 19.99

  // Fonction pour gérer l'ajout au panier
  const handleAddToCart = (subscriptionType: string) => {
    if (!product || !product.available) return

    const normalizedSubscription = subscriptionType.toUpperCase()
    const price =
      normalizedSubscription === "MONTHLY"
        ? prixMensuel
        : normalizedSubscription === "YEARLY"
          ? prixAnnuel
          : normalizedSubscription === "PER_MACHINE"
            ? prixParAppareil
            : prixUnitaire

    const cartItem: CartItem = {
      id: product.id_product.toString(),
      name: product.name,
      price: price,
      quantity: quantity,
      subscription: normalizedSubscription,
      uniqueId: `${product.id_product}-${normalizedSubscription}-${Date.now()}`,
      imageUrl: product.product_caroussel_images?.[0]?.url || undefined,
    }

    addToCart(cartItem)
    console.log("Produit ajouté au panier:", cartItem)
    setQuantity(1) // Réinitialiser la quantité après ajout
  }

  const handleScrollToPricingTable = () => {
    pricingTableRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="bg-white">
      {/* En-tête du produit */}
      <section className="bg-gradient-to-b from-[#302082]/5 to-white py-8 px-6">
        <h1 className="text-4xl font-extrabold text-[#302082] text-center mb-2 relative pb-3 inline-block mx-auto">
          {product.name}
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>

        <div className="max-w-5xl mx-auto mt-6">
          {/* <CarouselPlugin images={product.product_caroussel_images} /> */}
          <CarouselPlugin />

          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <p className="text-lg text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </section>

      {/* Caractéristiques et CTA */}
      <section className="flex flex-col sm:flex-row gap-8 py-12 px-6 bg-gray-50 border-y border-gray-200">
        <div className="w-full sm:w-1/2 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-[#302082] mb-4 relative pb-2 inline-block">
            Caractéristiques techniques
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <div className="text-gray-700 leading-relaxed mt-4">
            {product.technical_specs}
          </div>
        </div>

        <div className="w-full sm:w-1/2 p-6 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            {product.available ? (
              <Badge className="mb-2 bg-green-600 text-white px-3 py-1 text-base">
                Disponible immédiatement
              </Badge>
            ) : (
              <Badge className="mb-2 bg-red-600 text-white px-3 py-1 text-base">
                Service indisponible
              </Badge>
            )}

            <h2 className="text-2xl font-bold text-[#302082] mt-2">
              {formatEuro(product.unit_price)}
            </h2>
          </div>

          <div className="flex justify-center w-full mt-4">
            {product.available ? (
              <Button
                className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-2 border-transparent hover:border-[#FF6B00] hover:bg-white hover:text-[#FF6B00] transition-colors duration-300 text-lg py-6 px-8"
                onClick={handleScrollToPricingTable}
              >
                S&apos;ABONNER MAINTENANT
              </Button>
            ) : (
              <Button
                className="bg-gray-400 text-white text-lg py-6 px-8"
                disabled
              >
                SERVICE INDISPONIBLE
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Table de tarification */}
      {product.available && (
        <section className="py-12 px-6 bg-white" ref={pricingTableRef}>
          <h2 className="text-2xl font-bold text-[#302082] text-center mb-8 relative pb-2 inline-block">
            Choisir une formule d&apos;abonnement
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full max-w-screen-lg mx-auto table-auto border-collapse shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#302082] text-white">
                  <th className="px-6 py-4 text-center">Modèle Tarifaire</th>
                  <th className="px-6 py-4 text-center">Prix</th>
                  <th className="px-6 py-4 text-center">Ajouter au Panier</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-center font-medium">
                    Abonnement Mensuel
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-[#302082]">
                      {formatEuro(prixUnitaire)}
                    </div>
                    <div className="text-sm text-gray-600">
                      puis {formatEuro(prixMensuel)} / mois
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      onClick={() => handleAddToCart("MONTHLY")}
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>

                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-center font-medium">
                    Abonnement Annuel
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-[#302082]">
                      {formatEuro(prixUnitaire)}
                    </div>
                    <div className="text-sm text-gray-600">
                      puis {formatEuro(prixAnnuel)} / an
                      <span className="block text-green-600 text-xs font-medium">
                        (dont 2 mois offerts)
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      onClick={() => handleAddToCart("YEARLY")}
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>

                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-center font-medium">
                    Coût par utilisateur
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-[#302082]">
                      {formatEuro(prixUnitaire)}
                    </div>
                    <div className="text-sm text-gray-600">
                      puis {formatEuro(prixParAppareil)} / utilisateur
                      supplémentaire
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      onClick={() => handleAddToCart("PER_USER")}
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>

                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 text-center font-medium">
                    Coût par Appareil
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="font-bold text-[#302082]">
                      {formatEuro(prixUnitaire)}
                    </div>
                    <div className="text-sm text-gray-600">
                      puis {formatEuro(prixParAppareil)} / appareil
                      supplémentaire
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      onClick={() => handleAddToCart("PER_MACHINE")}
                      className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
                    >
                      Ajouter au panier
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sélecteur de quantité */}
          <div className="flex justify-center items-center mt-10 space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Quantité :
            </label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="border-[#302082] text-[#302082] hover:bg-[#302082] hover:text-white"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >
                -
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                className="border-[#302082] text-[#302082] hover:bg-[#302082] hover:text-white"
                onClick={() => setQuantity(prev => prev + 1)}
              >
                +
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Produits similaires */}
      <section className="py-12 px-6 bg-gray-50 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-[#302082] mb-8 relative pb-2 inline-block">
          Services SaaS similaires
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h2>
        <TopProducts />
      </section>
    </div>
  )
}
