// components/ProductCard/BaseProductCard.tsx
import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Product } from "@prisma/client"
import { formatEuro } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

export interface BaseProductCardProps {
  product: Product & {
    category?: { name: string } | null
    isFeatured?: boolean
  }
  variant?: "default" | "featured"
  className?: string
}

export function BaseProductCard({
  product,
  variant = "default",
  className,
}: BaseProductCardProps) {
  const {
    id_product,
    name,
    unit_price,
    available,
    main_image,
    category,
    isFeatured,
  } = product

  const imageSrc = main_image || `/images/cyber${id_product}.jpg`
  const isFeaturedVariant = variant === "featured"

  return (
    <Link
      href={`/produit/${id_product}`}
      className={cn(
        "block transform transition-all duration-300 hover:scale-[1.02]",
        className
      )}
    >
      <Card
        className={cn(
          "h-full overflow-hidden border-2 border-transparent hover:border-[#302082] shadow-md hover:shadow-xl transition-all duration-300 group",
          isFeaturedVariant && "relative"
        )}
      >
        {/* Image */}
        <div
          className={cn(
            "relative w-full overflow-hidden bg-gray-100",
            isFeaturedVariant ? "h-40" : "h-44"
          )}
        >
          <Image
            src={imageSrc}
            alt={name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 group-hover:scale-110"
          />

          {/* Badge pour les produits vedettes */}
          {isFeaturedVariant && isFeatured && (
            <Badge className="absolute top-2 left-2 bg-[#302082] text-white">
              Vedette
            </Badge>
          )}

          {!available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-semibold text-white",
                  isFeaturedVariant ? "bg-[#FF6B00]" : "bg-red-600"
                )}
              >
                {isFeaturedVariant ? "Rupture de stock" : "Indisponible"}
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <CardContent
          className={cn("space-y-3", isFeaturedVariant ? "p-4" : "p-5")}
        >
          <CardTitle
            className={cn(
              "font-semibold text-[#302082] group-hover:text-[#FF6B00] transition-colors duration-300 relative pb-2 line-clamp-1",
              isFeaturedVariant ? "text-lg" : "text-lg"
            )}
          >
            {name}
            <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
          </CardTitle>

          {category && (
            <p className="text-sm text-gray-500 mb-1">
              {category.name || "Catégorie"}
            </p>
          )}

          <div className="flex justify-between items-center">
            <p
              className={cn(
                "font-bold",
                isFeaturedVariant ? "text-lg" : "text-xl"
              )}
            >
              {formatEuro(unit_price)}
            </p>

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
