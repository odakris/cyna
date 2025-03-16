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
import { ProductType } from "../../app/types"
import Link from "next/link"

export function ProductCard({
  id_produit,
  nom,
  description,
  caracteristiques_techniques,
  prix_unitaire,
  disponible,
  ordre_priorite,
  date_maj,
  id_categorie,
  image,
  stock,
}: ProductType) {
  return (
    <Link href={`/produit/${id_produit}`} passHref>
      <Card className="shadow-md rounded-2xl overflow-hidden border border-gray-300 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer">
        {/* Image */}
        <div className="relative w-full h-44 bg-gray-100">
          <Image
            // src={image}
            src={`/images/cyber${id_produit}.jpg`}
            // src="/images/cyber1.jpg"
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
          <CardDescription className="text-gray-600 text-sm leading-tight line-clamp-2">
            {description}
          </CardDescription>
          <p className="text-primary font-bold text-xl">{prix_unitaire} €</p>
          <p
            className={`text-sm font-medium ${disponible ? "text-green-600" : "text-red-600"}`}
          >
            {disponible ? "Disponible" : "Rupture de stock"}
          </p>
          <p
            className={`text-sm font-medium ${stock > 3 ? "text-green-600" : "text-red-600"}`}
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
            disabled={disponible === false}
            variant={"cyna"}
          >
            {disponible ? "Ajouter au panier" : "Indisponible"}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  )
}
