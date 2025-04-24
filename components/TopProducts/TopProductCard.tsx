import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatEuro } from "@/lib/utils/format"
import { FeaturedProduct } from "@/types/frontend-types"

interface TopProductCardProps {
  product: FeaturedProduct
}

export function TopProductCard({ product }: TopProductCardProps) {
  const { id_product, name, unit_price, available, main_image, category } =
    product

  const imageSrc = main_image || `/images/cyber${id_product}.jpg`

  return (
    <Link
      href={`/produit/${id_product}`}
      passHref
      className="block transform transition-all duration-300 hover:scale-[1.02]"
    >
      <Card className="overflow-hidden h-full cursor-pointer hover:shadow-lg transition-all duration-300 relative group border-2 border-transparent hover:border-[#302082]">
        <div className="relative h-40 overflow-hidden bg-gray-100">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority
          />

          {/* Badge "Produit vedette" */}
          <Badge className="absolute top-2 left-2 bg-[#302082] text-white">
            Vedette
          </Badge>

          {/* Indicateur de disponibilité */}
          {!available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-[#FF6B00] text-white px-3 py-1 rounded-full text-sm font-semibold">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <div className="flex flex-col h-full">
            <div className="mb-2">
              <h3 className="font-semibold text-[#302082] text-lg line-clamp-1 group-hover:text-[#FF6B00] transition-colors duration-300">
                {name}
              </h3>
              <p className="text-sm text-gray-500 mb-1">
                {category?.name || "Catégorie"}
              </p>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold">{formatEuro(unit_price)}</p>
                {available ? (
                  <Badge className="ml-2 bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                    Disponible
                  </Badge>
                ) : (
                  <Badge className="ml-2 bg-red-600 hover:bg-red-700 text-white transition-colors duration-300">
                    Indisponible
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
