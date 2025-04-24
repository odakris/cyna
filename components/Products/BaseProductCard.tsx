// 1. components/ProductCard/BaseProductCard.tsx (amélioré)
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
        "block transform transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#302082] focus:ring-opacity-50 rounded-lg",
        className
      )}
    >
      <Card
        className={cn(
          "h-full overflow-hidden border border-gray-200 hover:border-[#302082] shadow-sm hover:shadow-lg transition-all duration-300 group",
          isFeaturedVariant && "relative"
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-gray-100",
            isFeaturedVariant ? "h-32 sm:h-36 md:h-40" : "h-36 sm:h-40 md:h-44"
          )}
        >
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {isFeaturedVariant && isFeatured && (
            <Badge className="absolute top-2 left-2 bg-[#302082] text-white text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
              Vedette
            </Badge>
          )}

          {!available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span
                className={cn(
                  "px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold text-white",
                  isFeaturedVariant ? "bg-[#FF6B00]" : "bg-red-600"
                )}
              >
                {isFeaturedVariant ? "Rupture de stock" : "Indisponible"}
              </span>
            </div>
          )}
        </div>

        <CardContent
          className={cn(
            "space-y-2 sm:space-y-3",
            isFeaturedVariant ? "p-3 sm:p-4" : "p-3 sm:p-4 md:p-5"
          )}
        >
          <CardTitle
            className={cn(
              "font-semibold text-[#302082] group-hover:text-[#FF6B00] transition-colors duration-300 relative pb-1.5 sm:pb-2 line-clamp-2 sm:line-clamp-1",
              isFeaturedVariant
                ? "text-base sm:text-lg"
                : "text-base sm:text-lg"
            )}
          >
            {name}
            <span className="absolute bottom-0 left-0 w-full h-0.5 sm:h-1 bg-[#302082] rounded"></span>
          </CardTitle>

          {category && (
            <p className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">
              {category.name || "Catégorie"}
            </p>
          )}

          <div className="flex justify-between items-center">
            <p
              className={cn(
                "font-bold",
                isFeaturedVariant
                  ? "text-base sm:text-lg"
                  : "text-base sm:text-lg md:text-xl"
              )}
            >
              {formatEuro(unit_price)}
            </p>

            {available ? (
              <Badge className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-300 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
                Disponible
              </Badge>
            ) : (
              <Badge className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300 text-xs sm:text-sm px-1.5 sm:px-2 py-0.5">
                Indisponible
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
