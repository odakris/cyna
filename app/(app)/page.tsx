"use client"

import React from "react"
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin"
import { CategoryGrid } from "@/components/CategoryGrid/CategoryGrid"
import { TopProducts } from "@/components/TopProduits/TopProduits"
import MainMessage from "@/components/MainMessage/MainMessage"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4">
      {/* CAROUSEL */}
      <div className="w-full my-8">
        <CarouselPlugin />
      </div>

      {/* MAIN MESSAGE */}
      <div className="w-full my-8">
        <MainMessage />
      </div>

      {/* CATEGORY GRID */}
      <div className="w-full my-8">
        <h1 className="text-2xl font-bold mb-4 w-full text-left">
          Nos Catégories
        </h1>
        <CategoryGrid />
      </div>

      {/* TOP PRODUCTS */}
      <div className="w-full my-8">
        <h1 className="text-2xl font-bold mb-4 w-full text-left">
          Les Top Produits du moment
        </h1>
        <TopProducts />
      </div>
    </div>
  )
}
