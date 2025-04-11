"use client"

import React, { useState } from "react"
import { ProductCard } from "../ProductCard/ProductCard"
import type { CategoryType, ProductType } from "@/types/Types"

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
    return [...products].sort((a, b) =>
      order === "asc"
        ? a.unit_price - b.unit_price
        : b.unit_price - a.unit_price
    )
  }

  const sortProductsByNewness = (
    products: ProductType[],
    order: "new" | "old"
  ) => {
    return [...products].sort((a, b) => {
      const dateA = new Date(a.last_updated)
      const dateB = new Date(b.last_updated)
      return order === "new"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime()
    })
  }

  const sortProductsByAvailability = (
    products: ProductType[],
    order: "available" | "unavailable"
  ) => {
    return [...products].sort(a =>
      order === "available" ? (a.available ? -1 : 1) : a.available ? 1 : -1
    )
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (minPrice !== "" && maxPrice !== "" && minPrice > maxPrice) {
      setPriceError(
        "Le prix minimum ne peut pas être supérieur au prix maximum."
      )
      return
    }

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

      let sortedProducts = sortProductsByPrice(data, sortOrder)
      sortedProducts = sortProductsByAvailability(
        sortedProducts,
        sortByAvailability
      )
      sortedProducts = sortProductsByNewness(sortedProducts, sortByNewness)
      setProducts(sortedProducts)
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
        {/* Titre et Description */}
        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label htmlFor="title" className="text-lg font-semibold mb-2">
              Titre :
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Entrez le titre du produit"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label htmlFor="description" className="text-lg font-semibold mb-2">
              Description :
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Entrez la description du produit"
            />
          </div>
        </div>

        {/* Caractéristiques techniques et Catégories */}
        <div className="flex gap-4">
          {/* Caractéristiques techniques */}
          <div className="flex flex-col w-1/2">
            <label htmlFor="features" className="text-lg font-semibold mb-2">
              Caractéristiques techniques :
            </label>
            <input
              type="text"
              id="features"
              value={features}
              onChange={e => setFeatures(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              placeholder="Entrez les caractéristiques techniques"
            />
          </div>

          {/* Catégories */}
          <div className="flex flex-col w-1/2">
            <label htmlFor="categories" className="text-lg font-semibold mb-2">
              Catégories :
            </label>
            <select
              id="categories"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category.id_category} value={category.id_category}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prix minimum et maximum */}
        <div className="flex gap-4">
          <div className="flex flex-col w-1/2">
            <label htmlFor="minPrice" className="text-lg font-semibold mb-2">
              Prix minimum :
            </label>
            <input
              type="number"
              id="minPrice"
              value={minPrice}
              onChange={e => handlePriceChange("min", Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 w-full"
              min="0"
            />
          </div>
          <div className="flex flex-col w-1/2">
            <label htmlFor="maxPrice" className="text-lg font-semibold mb-2">
              Prix maximum :
            </label>
            <input
              type="number"
              id="maxPrice"
              value={maxPrice}
              onChange={e => handlePriceChange("max", Number(e.target.value))}
              className="border border-gray-300 rounded-md p-2 w-full"
              min="0"
            />
          </div>
        </div>

        {/* Affichage de l'erreur de prix */}
        {priceError && <p className="text-red-500 text-center">{priceError}</p>}

        {/* Uniquement disponible */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            {" "}
            {/* Ajout de items-center pour centrer la colonne */}
            <label
              htmlFor="onlyAvailable"
              className="text-lg font-semibold mb-2"
            >
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

      {/* Résultats de recherche */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Services correspondants :</h2>
        <div className="flex justify-between mt-4 mb-4">
          <button
            onClick={() => {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              setProducts(prevProducts =>
                sortProductsByPrice(prevProducts, sortOrder)
              )
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Trier par prix {sortOrder === "asc" ? "décroissant" : "croissant"}
          </button>
          <button
            onClick={() => {
              setSortByNewness(sortByNewness === "new" ? "old" : "new")
              setProducts(prevProducts =>
                sortProductsByNewness(prevProducts, sortByNewness)
              )
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Trier par {sortByNewness === "new" ? "nouveaux" : "anciens"}
          </button>
          <button
            onClick={() => {
              setSortByAvailability(
                sortByAvailability === "available" ? "unavailable" : "available"
              )
              setProducts(prevProducts =>
                sortProductsByAvailability(prevProducts, sortByAvailability)
              )
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-200"
          >
            Trier par disponibilité (
            {sortByAvailability === "available" ? "Indisponible" : "Disponible"}
            )
          </button>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {products.map(product => {
              return (
                <ProductCard
                  key={product.id_product}
                  id_product={product.id_product}
                  name={product.name}
                  unit_price={product.unit_price}
                  available={product.available}
                  priority_order={product.priority_order}
                  last_updated={product.last_updated}
                  id_category={product.id_category}
                  image={product.image}
                  stock={product.stock}
                  description={""}
                  technical_specs={""}
                  created_at={""}
                  updated_at={""}
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
