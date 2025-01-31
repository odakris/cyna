"use client"

import { useState } from "react"
import { getFilteredProducts } from "../../lib/serverActions" // Importer la fonction de recherche

export default function Page() {
  // État pour stocker les produits récupérés
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  // Récupérer les catégories disponibles (vous pouvez aussi les charger côté serveur avec `getServerSideProps` ou `getStaticProps`)
  // Par exemple, les catégories peuvent être définies statiquement pour l'instant

  // Fonction de gestion de la recherche
  const handleSearch = async e => {
    e.preventDefault()

    // Récupérer les critères de recherche
    const criteria = {
      title: e.target.title.value,
      description: e.target.description.value,
      features: e.target.features.value,
      minPrice: parseFloat(e.target.minPrice.value) || undefined,
      maxPrice: parseFloat(e.target.maxPrice.value) || undefined,
      categories: Array.from(e.target.categories.selectedOptions, option =>
        parseInt(option.value)
      ),
      onlyAvailable: e.target.onlyAvailable.checked,
    }

    // Appeler la fonction qui récupère les produits en fonction des critères
    const productsData = await getFilteredProducts(criteria)

    // Mettre à jour l'état avec les produits récupérés
    setProducts(productsData)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Titre */}
      <h1 className="text-center text-3xl font-bold mb-6">
        Recherche avancée des services
      </h1>

      {/* Formulaire de recherche avec les filtres */}
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Champ Titre */}
        <div className="flex flex-col items-center">
          <label htmlFor="title" className="text-lg font-semibold mb-2">
            Titre:
          </label>
          <input
            type="text"
            name="title"
            id="title"
            className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
          />
        </div>

        {/* Champ Description */}
        <div className="flex flex-col items-center">
          <label htmlFor="description" className="text-lg font-semibold mb-2">
            Description:
          </label>
          <input
            type="text"
            name="description"
            id="description"
            className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
          />
        </div>

        {/* Champ Caractéristiques techniques */}
        <div className="flex flex-col items-center">
          <label htmlFor="features" className="text-lg font-semibold mb-2">
            Caractéristiques techniques:
          </label>
          <input
            type="text"
            name="features"
            id="features"
            className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
          />
        </div>

        {/* Prix minimum et maximum */}
        <div className="flex justify-between gap-4">
          <div className="flex flex-col items-center w-full">
            <label htmlFor="minPrice" className="text-lg font-semibold mb-2">
              Prix minimum:
            </label>
            <input
              type="number"
              name="minPrice"
              id="minPrice"
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
            />
          </div>
          <div className="flex flex-col items-center w-full">
            <label htmlFor="maxPrice" className="text-lg font-semibold mb-2">
              Prix maximum:
            </label>
            <input
              type="number"
              name="maxPrice"
              id="maxPrice"
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
            />
          </div>
        </div>

        {/* Catégories et Uni disponible côte à côte */}
        <div className="flex justify-between gap-4">
          {/* Champ Catégories */}
          <div className="flex flex-col items-center w-full max-w-xs">
            <label htmlFor="categories" className="text-lg font-semibold mb-2">
              Catégories:
            </label>
            <select
              name="categories"
              id="categories"
              multiple
              className="border border-gray-300 rounded-md p-2 w-full"
            >
              {categories.map(category => (
                <option
                  key={category.id_categorie}
                  value={category.id_categorie}
                >
                  {category.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Uni disponible toggle */}
          <div className="flex flex-col items-center w-full max-w-xs">
            <label
              htmlFor="onlyAvailable"
              className="text-lg font-semibold mb-2"
            >
              Uniquement disponible:
            </label>
            <input
              type="checkbox"
              name="onlyAvailable"
              id="onlyAvailable"
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
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            {products.map(product => (
              <div
                key={product.id_produit}
                className="border border-gray-300 rounded-md p-4"
              >
                <h3 className="font-bold text-lg">{product.nom}</h3>
                <p className="text-gray-700">{product.description}</p>
                <p className="text-gray-500">
                  Caractéristiques: {product.caracteristiques_techniques}
                </p>
                <p className="font-semibold">Prix: {product.prix_unitaire}€</p>
                <p>Catégorie: {product.categorie.nom}</p>
                <p
                  className={
                    product.disponible ? "text-green-500" : "text-red-500"
                  }
                >
                  {product.disponible ? "Disponible" : "Indisponible"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>Aucun service trouvé.</p>
        )}
      </div>
    </div>
  )
}
