"use client"

import React from "react"
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin"
import { CategoryGrid } from "@/components/CategoryGrid/CategoryGrid"
import { TopProducts } from "@/components/TopProducts/TopProducts"
import MainMessage from "@/components/MainMessage/MainMessage"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4 space-y-16">
      {/* CAROUSEL */}
      <section className="w-full my-4" aria-label="Carrousel promotionnel">
        <CarouselPlugin />
      </section>

      {/* MAIN MESSAGE */}
      <section
        className="w-full my-4 bg-gradient-to-r from-indigo-50 to-white rounded-lg shadow-sm p-6"
        aria-label="Message principal"
      >
        <MainMessage />
      </section>

      {/* CATEGORY GRID */}
      <section className="w-full my-4" aria-label="Catégories de produits">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary relative inline-block pb-2">
            Nos Catégories
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-gray-600 mt-2">
            Découvrez notre gamme complète de solutions de sécurité
          </p>
        </div>
        <CategoryGrid />
      </section>

      {/* TOP PRODUCTS */}
      <section className="w-full my-4" aria-label="Produits vedettes">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary relative inline-block pb-2">
            Les Top Produits du moment
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </h2>
          <p className="text-gray-600 mt-2">
            Découvrez nos solutions de sécurité les plus populaires
          </p>
        </div>
        <TopProducts />
      </section>
    </div>
  )
}
