"use client"

import React from "react"
import PricingCard from "@/components/PricingCard/PricingCard"
import { ProductCard } from "@/components/ProductCard/ProductCard"
import { Button } from "@/components/ui/button"
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin"

interface ProductPageProps {
  title: string
  description: string
  desc_technique: string
  availabilityText: string
  subscriptionButtonText: string
  products: {
    id: number
    title: string
    name: string
    description: string
    image: string
    price: string
    stock: number
  }[]
}

const ProductPageBis = ({
  title,
  description,
  desc_technique,
  availabilityText,
  subscriptionButtonText,
  products,
}: ProductPageProps) => {
  const plansData = [
    {
      id: 1,
      chipLabel: "Mensuel",
      planTitle: "Accès de base",
      features: [
        "Support Standard",
        "Essai gratuit de 14 jours",
        "Fonctionnalités basiques",
        "Personnalisation",
      ],
      price: "15,00€",
      period: "mois",
      buttonText: "S'abonner",
    },
    {
      id: 2,
      chipLabel: "Annuel",
      planTitle: "Accès complet",
      features: [
        "Support Premium",
        "Essai gratuit de 30 jours",
        "Fonctionnalités complètes",
        "Personnalisation",
      ],
      price: "144,00€",
      period: "année",
      buttonText: "S'abonner",
    },
    {
      id: 3,
      chipLabel: "Par utilisateur",
      planTitle: "Accès limité",
      features: [
        "Support Standard",
        "Essai gratuit de 7 jours",
        "Fonctionnalités limitées",
        "Personnalisation",
      ],
      price: "10,00€",
      period: "mois",
      buttonText: "S'abonner",
    },
    {
      id: 4,
      chipLabel: "Par utilisateur",
      planTitle: "Accès limité",
      features: [
        "Support Standard",
        "Essai gratuit de 7 jours",
        "Fonctionnalités limitées",
        "Personnalisation",
      ],
      price: "10,00€",
      period: "mois",
      buttonText: "S'abonner",
    },
  ]

  return (
    <>
      {/* Section Hero */}
      <section className="bg-white py-8 px-6 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">{title}</h1>
        <CarouselPlugin />
        <p className="w-full text-lg text-gray-700 mt-6 mx-auto">
          {description}
        </p>
      </section>
      {/* Section Caractéristiques Techniques et Disponibilité */}
      <section className="flex flex-col sm:flex-row gap-8 py-8 px-6 bg-gray-50">
        <div className="w-full sm:w-1/2 p-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Caractéristiques techniques
          </h2>
          <p className="text-sm text-gray-600 text-center">{desc_technique}</p>
        </div>
        <div className="w-full sm:w-1/2 p-4 flex items-center justify-center">
          {/* Flex pour centrer le bouton */}
          <div className="w-full h-full">
            {/* Ajout d'un wrapper pour gérer la largeur */}
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              Disponible immédiatement
            </h2>
            <Button
              className="w-full h-[60%] text-2xl"
              variant="cyna"
              aria-label={availabilityText}
            >
              {subscriptionButtonText}
            </Button>
          </div>
        </div>
      </section>
      {/* Section Offres et Formules */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">
          Offres et Formules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
          {plansData.map((plan, index) => (
            <PricingCard key={`${plan.id}-${index}`} {...plan} />
          ))}
        </div>
      </section>

      {/* Similar Products Section */}
      <section className="py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">
          Services SaaS similaires
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-6">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </>
  )
}

export default ProductPageBis
