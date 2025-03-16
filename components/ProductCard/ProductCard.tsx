"use client"

import * as React from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ProductType } from "../../app/types"

export function ProductCard({
  id_produit,
  nom,
  prix_unitaire,
  disponible,
}: ProductType) {
  return (
    <Card
      href={`/produit/${id_produit}`}
      className="shadow-md rounded-2xl overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative w-full h-44 bg-gray-100">
        <Image
          src={`/images/cyber${id_produit}.jpg`}
          alt={nom}
          layout="fill"
          objectFit="cover"
          className="rounded-t-2xl"
        />
      </div>

      {/* Contenu */}
      <CardContent className="p-5 space-y-3">
        <CardTitle className="text-lg font-semibold text-gray-800 line-clamp-1">
          {nom}
        </CardTitle>
        <p className="text-primary font-bold text-xl">{prix_unitaire} €</p>
        <p
          className={`text-sm font-medium ${disponible ? "text-green-600" : "text-red-600"}`}
        >
          {disponible ? "Disponible" : "Rupture de stock"}
        </p>
      </CardContent>
    </Card>
  )
}
