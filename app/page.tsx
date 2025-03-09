"use client"

import React from "react"
import { CarouselPlugin } from "../components/Carousel/CarouselPlugin"
import { CategoryGrid } from "../components/CategoryGrid/CategoryGrid"
import { Message } from "../components/Message/Message"
import { TopProducts } from "@/components/TopProduits/TopProduits"
import Link from "next/link"

export default function Home() {
  const message = "Message très très important sur les promotions et actualités"

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4">
      {/* CAROUSEL */}
      <div className="w-full my-8">
        <CarouselPlugin />
      </div>

      {/* MAIN MESSAGE */}
      <div className="w-full my-8">
        <Message message={message} />
      </div>

      {/* CATEGORY GRID */}
      <div className="w-full my-8">
        <h1 className="text-2xl font-bold mb-4 w-full text-left">
          Nos Catégories
        </h1>

        <CategoryGrid />
        <Link href="/admin/login">Connexion au Back-Office</Link>
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
