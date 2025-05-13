"use client"

import React, { useState } from "react"
import { useCart } from "@/context/CartContext"
import { useRouter } from "next/navigation"
import { useClientFetch } from "@/hooks/use-client-fetch"
import { Info, ArrowRight } from "lucide-react"
import Link from "next/link"
import CartList from "@/components/Cart/CartList"
import CartTotals from "@/components/Cart/CartTotals"
import EmptyCart from "@/components/Cart/EmptyCart"

export default function CartPage() {
  const { cart } = useCart()
  const router = useRouter()
  const { isMounted } = useClientFetch()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    console.log("[CartPage] Clic sur Passer à la caisse", {
      cartLength: cart.length,
    })
    setError(null)
    setIsLoading(true)

    try {
      if (cart.length === 0) {
        // console.error("[CartPage] Panier vide")
        throw new Error("Votre panier est vide.")
      }

      console.log("[CartPage] Redirection vers /checkout")
      router.push("/checkout")
    } catch (error: any) {
      // console.error("[CartPage] Erreur dans handleCheckout:", error)
      setError(
        error.message || "Une erreur s'est produite. Veuillez réessayer."
      )
    } finally {
      setIsLoading(false)
      console.log("[CartPage] Fin de handleCheckout")
    }
  }

  // Contenu pour le rendu côté serveur et initial côté client
  // pour éviter les erreurs d'hydratation
  if (!isMounted) {
    return (
      <div className="py-8 px-4 sm:px-6 container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#302082] relative pb-2 inline-block">
            Votre panier
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h1>
          <p className="text-gray-600 mt-2">Chargement...</p>
        </div>
        <div className="h-[400px] bg-gray-50 rounded-xl animate-pulse"></div>
      </div>
    )
  }

  const totalItems = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <div className="py-8 px-4 sm:px-6 container mx-auto">
      {/* En-tête de page */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#302082] relative pb-2 inline-block">
          Votre panier
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <p className="text-gray-600 mt-2">
          {cart.length > 0 ? (
            <>
              Vous avez <span className="font-medium">{totalItems}</span>{" "}
              article{totalItems > 1 ? "s" : ""} dans votre panier.
            </>
          ) : (
            "Votre panier est actuellement vide."
          )}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg flex items-start gap-3">
          <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <CartList items={cart} />
          </div>

          {/* Récapitulatif du panier */}
          <div className="lg:col-span-1">
            <CartTotals
              items={cart}
              onCheckout={handleCheckout}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Suggestions de produits */}
      {cart.length > 0 && (
        <div className="mt-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#302082]">
              Vous pourriez aussi être intéressé par
            </h2>
            <Link
              href="/categorie"
              className="text-[#302082] hover:underline flex items-center"
            >
              Voir toutes les catégories
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="bg-gradient-to-r from-[#302082]/5 to-white p-6 rounded-xl border border-[#302082]/10 shadow-sm">
            <p className="text-center text-gray-700">
              Pour compléter votre sécurité, découvrez nos autres solutions
              spécialisées disponibles dans notre catalogue.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
