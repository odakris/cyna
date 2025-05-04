"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShoppingBag } from "lucide-react"

const EmptyCart: React.FC = () => {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ShoppingBag className="h-8 w-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Votre panier est vide
      </h2>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Parcourez nos catégories pour découvrir nos solutions de sécurité
        adaptées aux besoins de votre entreprise.
      </p>
      <Button asChild className="bg-[#302082] hover:bg-[#302082]/90">
        <Link href="/produit">
          Découvrir nos produits <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}

export default EmptyCart
