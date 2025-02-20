"use client"

import React from "react"
import { CarouselPlugin } from "../components/Carousel/CarouselPlugin"
import { CategoryGrid } from "../components/CategoryGrid/CategoryGrid"
import { Message } from "../components/Message/Message"
import { TopProducts } from "@/components/TopProduits/TopProduits"

export default function Home() {
  const categories = [
    {
      id: 1,
      name: "Cat1",
      image: "/images/cyber1.jpg",
      order: 6,
      featured: true,
    },
    { id: 2, name: "Cat2", image: "/images/cyber2.jpg", order: 2 },
    { id: 3, name: "Cat3", image: "/images/cyber3.jpg", order: 3 },
    {
      id: 4,
      name: "Cat4",
      image: "/images/cyber4.jpg",
      order: 4,
      featured: true,
    },
  ]

  const products = [
    {
      id: 1,
      title: "PC Gamer RTX 4090",
      name: "PC Gamer",
      description: "Un PC ultra puissant avec une RTX 4090 et un i9-13900K.",
      image: "/images/cyber1.jpg",
      price: "3,499",
      stock: 4,
    },
    {
      id: 2,
      title: "Clavier Mécanique RGB",
      name: "Clavier Gaming",
      description: "Un clavier mécanique RGB avec switches personnalisables.",
      image: "/images/cyber2.jpg",
      price: "129",
      stock: 10,
    },
    {
      id: 3,
      title: "Souris Gaming Pro",
      name: "Souris Gamer",
      description: "Une souris gaming ultra précise avec 16 000 DPI.",
      image: "/images/cyber3.jpg",
      price: "89",
      stock: 7,
    },
    {
      id: 4,
      title: "Casque Audio Surround 7.1",
      name: "Casque Gaming",
      description: "Un casque immersif avec son surround 7.1 et microphone.",
      image: "/images/cyber4.jpg",
      price: "159",
      stock: 3,
    },
  ]

  const message = "Message très très important sur les promotions et actualités"

  return (
    <div className="flex flex-col justify-center items-center min-h-screen px-4">
      <CarouselPlugin />
      <Message message={message} />

      <h1 className="text-2xl font-bold mb-4 w-full text-left">
        Nos Catégories
      </h1>
      <CategoryGrid categories={categories} />

      <h1 className="text-2xl font-bold mb-4 w-full text-left">
        Les Top Produits du moment
      </h1>
      <TopProducts products={products} />
    </div>
  )
}
