"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CarouselPlugin } from "@/components/Carousel/CarouselPlugin"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductType } from "../../types"
import { TopProducts } from "../../../components/TopProduits/TopProduits"

const ProductPage = () => {
  const { id } = useParams()
  const [product, setProduct] = useState<ProductType>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!id) return

    const fetchProductById = async () => {
      try {
        const response = await fetch(`/api/products/${id}`)
        if (!response.ok)
          throw new Error("Erreur lors de la récupération du produit")
        const data: ProductType = await response.json()
        setProduct(data)
      } catch (error) {
        setError("Erreur lors de la récupération du produit")
        console.error("Erreur lors de la récupération du produit :", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProductById()
  }, [id])

  if (error) {
    return (
      <p className="text-center mt-10 text-red-500">
        {error ?? "Produit non trouvé."}
      </p>
    )
  }

  return (
    <>
      <section className="bg-white py-8 px-6 text-center">
        {loading ? (
          <Skeleton className="w-1/2 h-10 mx-auto mb-4" />
        ) : (
          <h1 className="text-4xl font-extrabold text-gray-900">
            {product?.nom}
          </h1>
        )}

        <CarouselPlugin />

        {loading ? (
          <Skeleton className="w-3/4 h-6 mx-auto mt-6" />
        ) : (
          <p className="w-full text-lg text-gray-700 mt-6 mx-auto">
            {product?.description}
          </p>
        )}
      </section>

      {/* Section Caractéristiques Techniques et Disponibilité */}
      <section className="flex flex-col sm:flex-row gap-8 py-8 px-6 bg-gray-50">
        <div className="w-full sm:w-1/2 p-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Caractéristiques techniques
          </h2>
          {loading ? (
            <Skeleton className="w-3/4 h-6 mx-auto" />
          ) : (
            <p className="text-sm text-gray-600 text-center">
              {product?.caracteristiques_techniques}
            </p>
          )}
        </div>

        <div className="w-full sm:w-1/2 p-4 flex items-center justify-center">
          <div className="w-full h-full">
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
              {loading ? (
                <Skeleton className="w-1/2 h-6 mx-auto" />
              ) : (
                "Disponible immédiatement"
              )}
            </h2>

            {loading ? (
              <Skeleton className="w-full h-[60%] rounded-lg" />
            ) : (
              <Button className="w-full h-[60%] text-2xl" variant="cyna">
                Abonnement
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Similar Products Section */}
      <section className="py-12 px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Services SaaS similaires
        </h2>

        <div className="w-full my-8">
          <TopProducts />
        </div>
      </section>
    </>
  )
}

export default ProductPage
