"use client"

import React, { useRef, useEffect } from "react"
import Image from "next/image"
import {
  Package,
  Tag,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronRight,
  Info,
  MousePointerClick,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { truncateText } from "@/lib/utils/format"

type SearchResultsProps = {
  isLoading: boolean
  results: {
    products: Array<{
      id_product: number
      name: string
      description: string
      category: { name: string } | null
      main_image: string
    }>
    categories: Array<{
      id_category: number
      name: string
      description: string
      image: string
    }>
  }
  query: string
  closeResults: () => void
  goToProduct: (productId: number) => void
  goToCategory: (categoryId: number) => void
  performFullSearch: () => void
  width?: string
}

export function SearchResults({
  isLoading,
  results,
  query,
  closeResults,
  goToProduct,
  goToCategory,
  performFullSearch,
  width = "w-full md:w-96",
}: SearchResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const hasResults =
    results.products.length > 0 || results.categories.length > 0

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        closeResults()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [closeResults])

  // Check if content is scrollable
  useEffect(() => {
    if (scrollRef.current) {
      const hasScroll =
        scrollRef.current.scrollHeight > scrollRef.current.clientHeight
      if (hasScroll && scrollRef.current.parentElement) {
        scrollRef.current.parentElement.classList.add("has-scroll")
      } else if (scrollRef.current.parentElement) {
        scrollRef.current.parentElement.classList.remove("has-scroll")
      }
    }
  }, [results])

  return (
    <Card
      ref={resultsRef}
      className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 ${width} bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 transition-all duration-300 ease-in-out`}
      style={{
        boxShadow:
          "0 12px 30px -5px rgba(48, 32, 130, 0.25), 0 2px 8px rgba(0, 0, 0, 0.1)",
        maxHeight: "500px",
      }}
    >
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center text-gray-600 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-3 text-[#FF6B00]" />
            <p className="font-medium text-sm">Chargement des résultats...</p>
          </div>
        ) : hasResults ? (
          <div className="relative">
            {/* Scroll shadow */}
            <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-white/90 to-transparent pointer-events-none opacity-0 transition-opacity duration-300 z-10 scroll-shadow"></div>

            <ScrollArea
              className="max-h-[500px] overflow-auto custom-scroll"
              ref={scrollRef}
            >
              <div className="divide-y divide-gray-100">
                {/* Categories */}
                {results.categories.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <Tag className="h-4 w-4 mr-2 text-[#302082]" />
                      <span>Catégories ({results.categories.length})</span>
                    </div>
                    <div className="space-y-2">
                      {results.categories.map(category => (
                        <div
                          key={category.id_category}
                          className="flex items-center p-3 rounded-lg hover:bg-[#302082]/5 cursor-pointer transition-all duration-300 group border border-transparent hover:border-[#FF6B00]/20"
                          onClick={() => goToCategory(category.id_category)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Voir la catégorie ${category.name}`}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                              goToCategory(category.id_category)
                            }
                          }}
                        >
                          <div className="h-14 w-14 relative rounded-md overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                            <Image
                              src={
                                category.image ||
                                `/images/cyber${category.id_category}.jpg`
                              }
                              alt={category.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                              sizes="56px"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-[#302082] group-hover:text-[#FF6B00] transition-colors duration-200">
                                {category.name}
                              </p>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all duration-300" />
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1 group-hover:text-gray-700 transition-colors">
                              {truncateText(category.description, 60)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {results.products.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center mb-3 text-sm font-semibold text-gray-700">
                      <Package className="h-4 w-4 mr-2 text-[#302082]" />
                      <span>Produits ({results.products.length})</span>
                    </div>
                    <div className="space-y-2">
                      {results.products.map(product => (
                        <div
                          key={product.id_product}
                          className="flex items-center p-3 rounded-lg hover:bg-[#302082]/5 cursor-pointer transition-all duration-300 group border border-transparent hover:border-[#FF6B00]/20"
                          onClick={() => goToProduct(product.id_product)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Voir le produit ${product.name}`}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === " ") {
                              goToProduct(product.id_product)
                            }
                          }}
                        >
                          <div className="h-14 w-14 relative rounded-md overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100 shadow-sm">
                            <Image
                              src={
                                product.main_image ||
                                `/images/cyber${product.id_product}.jpg`
                              }
                              alt={product.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                              sizes="56px"
                            />
                          </div>
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-[#302082] group-hover:text-[#FF6B00] transition-colors duration-200">
                                {product.name}
                              </p>
                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#FF6B00] group-hover:translate-x-1 transition-all duration-300" />
                            </div>
                            <div className="flex items-center text-xs mt-1">
                              {product.category && (
                                <Badge
                                  variant="outline"
                                  className="mr-2 bg-[#302082]/5 text-[#302082] border-[#302082]/20 font-medium px-2 py-0.5 rounded-full"
                                >
                                  {product.category.name}
                                </Badge>
                              )}
                              <span className="text-gray-500 line-clamp-1 group-hover:text-gray-700 transition-colors">
                                {truncateText(product.description, 40)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          query.length >= 2 && (
            <div className="p-6 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4 shadow-sm">
                <AlertCircle className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Aucun résultat trouvé
              </h3>
              <p className="text-gray-500 mb-5 text-sm">
                Aucun résultat pour &quot;{query}&quot;
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10 hover:text-[#FF6B00] font-medium rounded-lg px-4"
                  onClick={performFullSearch}
                >
                  Recherche avancée
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeResults}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg px-4"
                >
                  Fermer
                </Button>
              </div>
            </div>
          )
        )}

        {/* Tip for few results */}
        {hasResults &&
          results.products.length + results.categories.length < 3 && (
            <div className="px-4 py-3 bg-[#302082]/5 border-t border-[#302082]/10">
              <div className="flex items-start text-xs text-[#302082]">
                <Info className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                <p>
                  Essayez la recherche avancée pour des résultats plus précis
                  avec des filtres supplémentaires.
                </p>
              </div>
            </div>
          )}

        {/* Mobile interaction indicator */}
        {hasResults &&
          typeof window !== "undefined" &&
          window.innerWidth < 768 && (
            <div className="absolute bottom-16 right-3 bg-gradient-to-br from-[#302082] to-[#FF6B00] text-white rounded-full p-2 shadow-lg animate-pulse hidden md:hidden help-indicator">
              <MousePointerClick className="h-5 w-5" />
            </div>
          )}
      </CardContent>
    </Card>
  )
}
