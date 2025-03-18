"use client"

import * as React from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ProductType } from "../../types/Types"

export function ProductCard({
  id_product,
  name,
  unit_price,
  available,
  // priority_order,
  // last_updated,
  // id_category,
  // image,
  // stock,
}: ProductType) {
  return (
    <Card
      href={`/produit/${id_product}`}
      className="shadow-md rounded-2xl overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative w-full h-44 bg-gray-100">
        <Image
          src={`/images/cyber${id_product}.jpg`}
          alt={name}
          layout="fill"
          objectFit="cover"
          className="rounded-t-2xl"
        />
      </div>

      {/* Contenu */}
      <CardContent className="p-5 space-y-3">
        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
          {name}
        </CardTitle>
        <p className="text-primary font-bold text-xl">{unit_price} €</p>
        <p
          className={`text-sm font-medium ${available ? "text-green-600" : "text-red-600"}`}
        >
          {available ? "Disponible" : "Rupture de stock"}
        </p>
      </CardContent>
    </Card>
  )
}
