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

export function ProductCard({ title, name, description, image, price, stock }: ProductProps) {
  return (
    <Card className="w-[250px] shadow-lg rounded-xl overflow-hidden border border-gray-200">
      {/* Image */}
      <div className="relative w-full h-40">
        <Image src={image} alt={name} layout="fill" objectFit="cover" className="rounded-t-lg" />
      </div>

      {/* Contenu */}
      <CardContent className="p-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        <CardDescription className="text-gray-600 text-sm mb-2">{description}</CardDescription>
        <p className="text-primary font-bold text-xl">{price} €</p>
        <p className={`text-sm ${stock > 5 ? "text-green-600" : "text-red-600"}`}>
          {stock > 0 ? `Stock: ${stock} restant${stock > 1 ? "s" : ""}` : "Rupture de stock"}
        </p>
      </CardContent>

      {/* Bouton */}
      <CardFooter className="p-4">
        <Button className="w-full" disabled={stock === 0}>
          {stock > 0 ? "Ajouter au panier" : "Indisponible"}
        </Button>
      </CardFooter>
    </Card>
  )
}
