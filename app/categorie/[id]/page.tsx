"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductGrid } from "@/components/ProductGrid/ProductGrid"

export default function CategoryPage() {
  const [category, setCategory] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  // Utilisation de useParams pour récupérer l'ID de la catégorie
  const params = useParams()

  useEffect(() => {
    const id = params.id

    if (id) {
      const fetchCategory = async () => {
        try {
          const response = await fetch(`/api/categories/${id}`)
          if (response.ok) {
            const data = await response.json()
            setCategory(data)
          } else {
            console.error("Erreur lors de la récupération de la catégorie.")
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de la catégorie :", error)
        } finally {
          setLoading(false)
        }
      }

      fetchCategory()
    }
  }, [params])

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen">
        <Skeleton className="w-full h-[300px] rounded-lg" />
      </div>
    )
  }

  // Si la catégorie existe
  if (!category) {
    return <p>Catégorie non trouvée</p>
  }

  return (
    <div className="p-6">
      {/* Bandeau avec l'image de la catégorie et le nom en surimpression */}
      <div className="relative h-72 mb-6">
        <Image
          src={`/images/cyber${category.id_categorie}.jpg`}  // Utilisation de l'ID pour l'image
          alt={`Bandeau de la catégorie ${category.nom}`}
          layout="fill"
          objectFit="cover"
          className="rounded-t-lg"
        />
        {/* Surimpression du nom de la catégorie */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h2 className="text-white text-lg font-bold drop-shadow-lg">{category.nom}</h2>
        </div>
      </div>

      {/* Affichage du contenu supplémentaire */}
      <p className="mb-8">{category.description}</p>

      {/* Affichage de la grille de produits */}
      <ProductGrid products={category.produits} />
    </div>
  )
}
