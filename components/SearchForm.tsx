"use client"

import React, { useState } from "react"
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    // Création de la chaîne de recherche (query)
    const query = new URLSearchParams()

    if (title) query.append("query", title) // Utilisation du champ 'title' comme query principale
    if (description) query.append("description", description)
    if (features) query.append("features", features)
    if (minPrice) query.append("minPrice", String(minPrice))
    if (maxPrice) query.append("maxPrice", String(maxPrice))
    if (onlyAvailable) query.append("onlyAvailable", "true")
    if (selectedCategory) query.append("category", selectedCategory)

    try {
      console.log(
        "Recherche des produits avec les paramètres : ",
        query.toString()
      )

      const response = await fetch(`/api/products/search?${query.toString()}`)

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP : ${response.status} - ${response.statusText}`
        )
      }

      const data: ProductType[] = await response.json()
      console.log("Données reçues : ", data)

      setProducts(data)
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
              onChange={e => setMinPrice(Number(e.target.value))}
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
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {products.map(product => {
              // Trouver la catégorie associée au produit en utilisant id_categorie
              const productCategory = categories.find(
                category => category.id_categorie === product.id_categorie
              )

              return (
                <div
                  key={product.id_produit}
                  className="border border-gray-300 rounded-md p-4"
                >
                  <h3 className="font-bold text-lg">{product.nom}</h3>
                  <p className="text-gray-700">{product.description}</p>
                  <p className="text-gray-500">
                    Caractéristiques: {product.caracteristiques_techniques}
                  </p>
                  <p className="font-semibold">
                    Prix: {product.prix_unitaire}€
                  </p>

                  {/* Affichage de la catégorie à partir de id_categorie */}
                  <p>
                    Catégorie:{" "}
                    {productCategory ? productCategory.nom : "Non définie"}
                  </p>

                  <p
                    className={
                      product.disponible ? "text-green-500" : "text-red-500"
                    }
                  >
                    {product.disponible ? "Disponible" : "Indisponible"}
                  </p>
                </div>
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
