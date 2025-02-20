"use client"

import React from "react"
import { CarouselPlugin } from "../components/Carousel/CarouselPlugin"
import { CategoryGrid } from "../components/CategoryGrid/CategoryGrid"
import { Message } from "../components/Message/Message"

export default function Home() {
  const [categories, setCategories] = React.useState([
    {
      id: 1,
      name: "Cat1",
      image: "/images/cyber1.jpg",
      order: 1,
      featured: true,
    },
    { id: 2, name: "Cat2", order: 2, image: "/images/cyber2.jpg" },
    { id: 3, name: "Cat3", order: 5, image: "/images/cyber3.jpg" },
    {
      id: 4,
      name: "Cat4",
      order: 4,
      image: "/images/cyber4.jpg",
      featured: true,
    },
  ])

  const message = "Message très très important sur les promotions et actualités"

  return (
    <div className="flex flex-col justify-center items-center h-[100%]">
      <CarouselPlugin />
      <Message message={message} />
      <h1 className="text-2xl font-bold mb-4 w-full text-left">
        Nos Catégories
      </h1>
      <CategoryGrid categories={categories} />
    </div>
  )
}
