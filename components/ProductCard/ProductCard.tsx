"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import Image from "next/image"

interface ProductProps {
  title: string
  name: string
  description: string
  image: string
  price: string
  stock: number
}

export function ProductCard({
  title,
  name,
  description,
  image,
  price,
  stock,
}: ProductProps) {
  return (
    <Card className="shadow-md rounded-2xl overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
      {/* Image */}
      <div className="relative w-full h-44 bg-gray-100">
        <Image
          src={image}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-2xl"
        />
      </div>

      {/* Contenu */}
      <CardContent className="p-5 space-y-3">
        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
          {title}
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm leading-tight line-clamp-2">
          {description}
        </CardDescription>
        <p className="text-primary font-bold text-xl">{price} €</p>
        <p
          className={`text-sm font-medium ${stock > 5 ? "text-green-600" : "text-red-600"}`}
        >
          {stock > 0
            ? `Stock: ${stock} restant${stock > 1 ? "s" : ""}`
            : "Rupture de stock"}
        </p>
      </CardContent>

      {/* Bouton */}
      <CardFooter className="p-5">
        <Button
          className="w-full font-semibold py-2.5"
          disabled={stock === 0}
          variant={"cyna"}
        >
          {stock > 0 ? "Ajouter au panier" : "Indisponible"}
        </Button>
      </CardFooter>
    </Card>
  )
}
