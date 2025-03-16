"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { ProductType } from "../../app/types"

export function TopProductCard({ id_produit, nom }: ProductType) {
  return (
    <Card
      href={`/produit/${id_produit}`}
      className="relative w-full h-44 overflow-hidden rounded-lg border border-gray-300 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl"
    >
      {/* Image */}
      <Image
        src={`/images/cyber${id_produit}.jpg`}
        alt={nom}
        layout="fill"
        objectFit="cover"
        className="rounded-lg"
      />

      {/* Surimpression du Nom */}
      <div className="absolute bottom-0 left-0 w-full bg-black/60 text-white text-center text-lg font-semibold p-2">
        {nom}
      </div>
    </Card>
  )
}
