import React from "react"
import Carousel from "./HeroCarousel"
import { Button } from "./ui/button"
import PricingCards from "./PricingCard"
import {ProductCard }from "@/components/ProductCard/ProductCard"

const ProductPage = () => {


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
  }
]


  return (
    <>
      <div>
        <div className="relative w-full max-w-lg mx-auto mb-6 text-center">
          <p className="text-2xl font-bold">Nom du service</p>
        </div>
        <div>
          <Carousel />
        </div>
        <div>
          <p className="relative text-center mx-10 mt-6 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            finibus accumsan lectus, id euismod nibh tempor vitae. Donec elit
            turpis, suscipit sit amet elit vel, egestas auctor nulla. Sed nec
            pharetra tellus. Mauris porta mattis nunc at iaculis. Suspendisse
            potenti. Donec in tincidunt lacus. Maecenas eget efficitur dui.
            Nulla faucibus commodo tincidunt. Sed dui ipsum, eleifend sed arcu
            in, aliquet cursus turpis. Sed posuere eros tellus, eu condimentum
            dolor tincidunt a. Maecenas in aliquet est. Donec vitae lacinia
            neque. Fusce neque tortor, pretium quis dolor a, dictum dapibus.
          </p>
        </div>
      </div>
      <div className="flex">
        <div className="w-1/2 p-4">
          <p className="text-2xl font-bold relative text-center">
            Caractéristiques techniques
          </p>
          <p className="relative text-center mx-10 mt-6 text-sm">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            finibus accumsan lectus, id euismod nibh tempor vitae. Donec elit
            turpis, suscipit sit amet elit vel, egestas auctor nulla. Sed nec
            pharetra tellus. Mauris porta mattis nunc at iaculis. Suspendisse
            potenti. Donec in tincidunt lacus. Maecenas eget efficitur dui.
            Nulla faucibus commodo tincidunt. Sed dui ipsum, eleifend sed arcu
            in, aliquet cursus turpis. Sed posuere eros tellus, eu condimentum
            dolor tincidunt a. Maecenas in aliquet est. Donec vitae lacinia
            neque. Fusce neque tortor, pretium quis dolor a, dictum dapibus.
          </p>
        </div>
        <div className="w-1/2 p-4">
          <p className="text-2xl font-bold relative text-center">
            Disponible immédiatement
          </p>
          <Button className="w-full h-full mt-6 text-2xl text-white font-semibold">
            S'abonner maintenant !
          </Button>
        </div>
      </div>
      <div className="mt-20 mx-10">
        <PricingCards />
      </div>

      <div className="width-full mx-10">
        <p className="text-2xl font-bold mx-10 mt-6 relative text-center">
          Services SaaS similaires
        </p>
        <div className="mx-10 mt-6 flex flex-row">
          {products.map(product => (
                 <ProductCard key={product.id} {...product} />
               ))}
        </div>
      </div>
    </>
  )
}

export default ProductPage
