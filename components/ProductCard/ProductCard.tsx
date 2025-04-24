import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Product } from "@prisma/client"
import { formatEuro } from "@/lib/utils/format"

export function ProductCard({
  id_product,
  name,
  unit_price,
  available,
}: Product) {
  return (
    <Link
      href={`/produit/${id_product}`}
      className="block transform transition-all duration-300 hover:scale-[1.02]"
    >
      <Card className="h-full overflow-hidden border-2 border-transparent hover:border-[#302082] shadow-md hover:shadow-xl transition-all duration-300 group">
        {/* Image */}
        <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
          <Image
            src={`/images/cyber${id_product}.jpg`}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 group-hover:scale-110"
          />

          {!available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <CardContent className="p-5 space-y-3">
          <CardTitle className="text-lg font-semibold text-[#302082] line-clamp-1 group-hover:text-[#FF6B00] transition-colors duration-300 relative pb-2">
            {name}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </CardTitle>

          <div className="flex justify-between items-center">
            <p className="font-bold text-xl">{formatEuro(unit_price)}</p>

            {available ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300">
                Disponible
              </Badge>
            ) : (
              <Badge className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300">
                Indisponible
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
