"use client"

import React from "react"
import { ProductCard } from "@/components/Products/ProductCard"
import { BaseProductGrid } from "@/components/Products/BaseProductGrid"
import { AdvancedSearchProps } from "@/types/Types"
import { useAdvancedSearch } from "@/hooks/use-advanced-search"
import { FilterPanel } from "@/components/AdvancedSearch/FilterPanel"
import { MobileFilterPanel } from "@/components/AdvancedSearch/MobileFilterPanel"
import { ActiveFilters } from "@/components/AdvancedSearch/ActiveFilters"
import { SortOptions } from "@/components/AdvancedSearch/SortOptions"

export default function AdvancedSearch({ categories }: AdvancedSearchProps) {
  const {
    // États
    title,
    description,
    features,
    priceRange,
    priceInput,
    selectedCategory,
    onlyAvailable,
    displayedProducts,
    loading,
    isFilterMenuOpen,
    sortOptions,
    activeFilters,

    // Manipulateurs d'état
    setTitle,
    setDescription,
    setFeatures,
    setPriceRange,
    setPriceInput,
    setSelectedCategory,
    setOnlyAvailable,
    setIsFilterMenuOpen,

    // Fonctions
    updateSort,
    handleSearch,
    resetFilters,
    handlePriceRangeChange,
    handlePriceInputChange,
    removeFilter,
    hasActiveFilters,
  } = useAdvancedSearch()

  // Regrouper les handlers pour les passer aux composants enfants
  const filterHandlers = {
    setTitle,
    setDescription,
    setFeatures,
    setPriceRange,
    setPriceInput,
    setSelectedCategory,
    setOnlyAvailable,
    handlePriceRangeChange,
    handlePriceInputChange,
    handleSearch,
    resetFilters,
    removeFilter,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#302082] mb-2">
          Recherche avancée
        </h1>
        <p className="text-gray-600">
          Trouvez le service SaaS idéal pour répondre à vos besoins en
          cybersécurité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panneau de filtres pour grands écrans */}
        <FilterPanel
          title={title}
          description={description}
          features={features}
          priceRange={priceRange}
          priceInput={priceInput}
          selectedCategory={selectedCategory}
          onlyAvailable={onlyAvailable}
          categories={categories}
          handlers={filterHandlers}
        />

        {/* Contenu principal et résultats */}
        <div className="lg:col-span-9">
          {/* Bouton pour afficher les filtres sur mobile */}
          <MobileFilterPanel
            title={title}
            description={description}
            features={features}
            priceRange={priceRange}
            priceInput={priceInput}
            selectedCategory={selectedCategory}
            onlyAvailable={onlyAvailable}
            categories={categories}
            isFilterMenuOpen={isFilterMenuOpen}
            setIsFilterMenuOpen={setIsFilterMenuOpen}
            handlers={filterHandlers}
          />

          {/* Filtres actifs */}
          <ActiveFilters
            activeFilters={activeFilters}
            categories={categories}
            removeFilter={removeFilter}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Options de tri */}
          <SortOptions
            sortOptions={sortOptions}
            updateSort={updateSort}
            productsCount={
              displayedProducts.filter(product => product.active).length
            }
          />

          {/* Résultats de recherche */}
          <BaseProductGrid
            loading={loading}
            isEmpty={displayedProducts.length === 0}
          >
            {displayedProducts
              .filter(product => product.active)
              .map(product => (
                <ProductCard key={product.id_product} {...product} />
              ))}
          </BaseProductGrid>
        </div>
      </div>
    </div>
  )
}
