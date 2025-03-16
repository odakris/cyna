"use client"

import React, { useState } from "react"
import { ProductCard } from "../ProductCard/ProductCard"
import type { CategoryType, ProductType } from "@/app/types"

type SearchFormProps = {
  categories: CategoryType[]
}

export default function SearchForm({ categories }: SearchFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [features, setFeatures] = useState("")
  const [minPrice, setMinPrice] = useState<number | "">("")
  const [maxPrice, setMaxPrice] = useState<number | "">("")
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | "">("")
  const [products, setProducts] = useState<ProductType[]>([])
  const [priceError, setPriceError] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [sortByNewness, setSortByNewness] = useState<"new" | "old">("new")
  const [sortByAvailability, setSortByAvailability] = useState<
    "available" | "unavailable"
  >("available")

  const handlePriceChange = (type: "min" | "max", value: number | "") => {
    if (type === "min") {
      setMinPrice(value)

      const max = maxPrice === "" ? Number.MAX_VALUE : Number(maxPrice)
      if (value !== "" && value > max) {
        setPriceError(
          "Le prix minimum ne peut pas être supérieur au prix maximum."
        )
      } else {
        setPriceError(null)
      }
    } else {
      setMaxPrice(value)

      const min = minPrice === "" ? 0 : Number(minPrice)
      if (value !== "" && value < min) {
        setPriceError(
          "Le prix maximum ne peut pas être inférieur au prix minimum."
        )
      } else {
        setPriceError(null)
      }
    }
  }

  const sortProductsByPrice = (
    products: ProductType[],
    order: "asc" | "desc"
  ) => {
    return [...products].sort((a, b) => {
      if (order === "asc") {
        return a.prix_unitaire - b.prix_unitaire // Tri croissant
      } else {
        return b.prix_unitaire - a.prix_unitaire // Tri décroissant
      }
    })
  }

  const sortProductsByNewness = (
    products: ProductType[],
    order: "new" | "old"
  ) => {
    return [...products].sort((a, b) => {
      const dateA = new Date(a.date_maj)
      const dateB = new Date(b.date_maj)

      if (order === "new") {
        return dateB.getTime() - dateA.getTime() // Tri par date la plus récente
      } else {
        return dateA.getTime() - dateB.getTime() // Tri par date la plus ancienne
      }
    })
  }

  const sortProductsByAvailability = (
    products: ProductType[],
    order: "available" | "unavailable"
  ) => {
    return [...products].sort((a, b) => {
      if (order === "available") {
        // Les produits disponibles viennent en premier
        return a.disponible === b.disponible ? 0 : a.disponible ? -1 : 1
      } else {
        // Les produits indisponibles viennent en premier
        return a.disponible === b.disponible ? 0 : a.disponible ? 1 : -1
      }
    })
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (minPrice !== "" && maxPrice !== "" && minPrice > maxPrice) {
      setPriceError(
        "Le prix minimum ne peut pas être supérieur au prix maximum."
      )
      return
    }

    // Création de la chaîne de recherche (query)
    const query = new URLSearchParams()

    if (title) query.append("query", title)
    if (description) query.append("description", description)
    if (features) query.append("features", features)
    if (minPrice) query.append("minPrice", String(minPrice))
    if (maxPrice) query.append("maxPrice", String(maxPrice))
    if (onlyAvailable) query.append("onlyAvailable", "true")
    if (selectedCategory) query.append("category", selectedCategory)

    try {
      const response = await fetch(`/api/products/search?${query.toString()}`)
      if (!response.ok) {
        throw new Error(
          `Erreur HTTP : ${response.status} - ${response.statusText}`
        )
      }
      const data: ProductType[] = await response.json()

      // Appliquer les tris
      let sortedProducts = sortProductsByPrice(data, sortOrder)
      sortedProducts = sortProductsByAvailability(
        sortedProducts,
        sortByAvailability
      )
      setProducts(sortedProducts) // Mise à jour de l'état des produits
    } catch (error) {
      console.error("Erreur lors de la recherche des produits:", error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-center text-3xl font-bold mb-6">
        Recherche avancée des services
      </h1>

      {/* Formulaire de recherche */}
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Titre */}
        <div className="flex flex-col items-center">
          <label htmlFor="title" className="text-lg font-semibold mb-2">
            Titre :
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
            placeholder="Entrez le titre du produit"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col items-center">
          <label htmlFor="description" className="text-lg font-semibold mb-2">
            Description :
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
            placeholder="Entrez la description du produit"
          />
        </div>

        {/* Caractéristiques techniques */}
        <div className="flex flex-col items-center">
          <label htmlFor="features" className="text-lg font-semibold mb-2">
            Caractéristiques techniques :
          </label>
          <input
            type="text"
            id="features"
            value={features}
            onChange={e => setFeatures(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
            placeholder="Entrez les caractéristiques techniques"
          />
        </div>

        {/* Prix minimum et maximum */}
        <div className="flex justify-between gap-4">
          <div className="flex flex-col items-center w-full">
            <label htmlFor="minPrice" className="text-lg font-semibold mb-2">
              Prix minimum :
            </label>
            <input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={e => handlePriceChange("min", Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
              min="0"
            />
          </div>
          <div className="flex flex-col items-center w-full">
            <label htmlFor="maxPrice" className="text-lg font-semibold mb-2">
              Prix maximum :
            </label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
              min="0"
            />
          </div>
        </div>

        {/* Affichage de l'erreur de prix */}
        {priceError && <p className="text-red-500 text-center">{priceError}</p>}

        {/* Catégories */}
        <div className="flex flex-col items-center">
          <label htmlFor="categories" className="text-lg font-semibold mb-2">
            Catégories :
          </label>
          <select
            id="categories"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(categorie => (
              <option
                key={categorie.id_categorie}
                value={categorie.id_categorie}
              >
                {categorie.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Uniquement disponible */}
        <div className="flex flex-col items-center">
          <label htmlFor="onlyAvailable" className="text-lg font-semibold mb-2">
            Uniquement disponible :
          </label>
          <input
            type="checkbox"
            id="onlyAvailable"
            checked={onlyAvailable}
            onChange={() => setOnlyAvailable(!onlyAvailable)}
            className="w-6 h-6"
          />
        </div>

        {/* Bouton de recherche */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Affichage des produits */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Services correspondants :</h2>

        {/* Bouton pour trier par Prix */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              const newSortOrder = sortOrder === "asc" ? "desc" : "asc"
              setSortOrder(newSortOrder)
              // Tri des produits après avoir changé l'ordre
              setProducts(prevProducts =>
                sortProductsByPrice(prevProducts, newSortOrder)
              )
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            {sortOrder === "asc" ? "Prix croissant" : "Prix décroissant"}
          </button>
        </div>

        {/* Bouton pour trier par nouveauté */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              const newSortByNewness = sortByNewness === "new" ? "old" : "new"
              setSortByNewness(newSortByNewness)
              setProducts(prevProducts =>
                sortProductsByNewness(prevProducts, newSortByNewness)
              )
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            {sortByNewness === "new" ? "Ancien" : "Nouveau"}
          </button>
        </div>

        {/* Bouton pour trier par disponibilité */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => {
              const newSortByAvailability =
                sortByAvailability === "available" ? "unavailable" : "available"
              setSortByAvailability(newSortByAvailability)
              setProducts(prevProducts =>
                sortProductsByAvailability(prevProducts, newSortByAvailability)
              )
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            {sortByAvailability === "available" ? "Disponible" : "Indisponible"}
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {products.map(product => {
              // Trouver la catégorie associée au produit en utilisant id_categorie
              const productCategory = categories.find(
                category => category.id_categorie === product.id_categorie
              )

              return (
                <ProductCard
                  key={product.id_produit}
                  id_produit={product.id_produit}
                  nom={product.nom}
                  prix_unitaire={product.prix_unitaire}
                  disponible={product.disponible}
                />
              )
            })}
          </div>
        ) : (
          <p>Aucun service trouvé.</p>
        )}
      </div>
    </div>
  )
}
